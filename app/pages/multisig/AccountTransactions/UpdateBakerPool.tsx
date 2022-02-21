/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import {
    AccountInfo,
    ConfigureBaker,
    Fraction,
    OpenStatus,
} from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { PlainDetail } from './proposal-details/shared';
import routes from '~/constants/routes.json';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import {
    accountInfoSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    convertToUpdateBakerPoolTransaction,
    UpdateBakerPoolDependencies,
    getSanitizedBakerPoolValues,
    updateBakerPoolTitle,
    UpdateBakerPoolFlowState,
} from '~/utils/transactionFlows/updateBakerPool';
import {
    displayPoolOpen,
    getBakerFlowChanges,
    getEstimatedConfigureBakerFee,
} from '~/utils/transactionFlows/configureBaker';
import DisplayMetadataUrl from '~/components/Transfers/DisplayMetadataUrl';
import withChainData from '~/utils/withChainData';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps
    extends Partial<UpdateBakerPoolFlowState & RequiredValues> {
    exchangeRate: Fraction;
}

const DisplayValues = ({ account, exchangeRate, ...values }: DisplayProps) => {
    const accountInfo: AccountInfo | undefined = useSelector(
        accountInfoSelector(account)
    );
    const sanitized = getSanitizedBakerPoolValues(values, accountInfo);
    const changes = getBakerFlowChanges(sanitized, accountInfo) ?? sanitized;

    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureBakerFee(
                  changes,
                  exchangeRate,
                  account.signatureThreshold
              )
            : undefined;

    return (
        <>
            <DisplayEstimatedFee
                className={displayTransferStyles.fee}
                estimatedFee={estimatedFee}
            />
            {(sanitized.openForDelegation !== undefined &&
                changes.openForDelegation === undefined) || (
                <PlainDetail
                    title="Pool delegation status"
                    value={
                        changes.openForDelegation !== undefined
                            ? displayPoolOpen(changes.openForDelegation)
                            : undefined
                    }
                />
            )}
            {(sanitized.commissions?.transactionFeeCommission !== undefined &&
                changes.commissions?.transactionFeeCommission ===
                    undefined) || (
                <DisplayBakerCommission
                    title="Transaction fee commission"
                    value={changes.commissions?.transactionFeeCommission}
                    placeholder
                />
            )}
            {(sanitized.commissions?.bakingRewardCommission !== undefined &&
                changes.commissions?.bakingRewardCommission === undefined) || (
                <DisplayBakerCommission
                    title="Baking reward commission"
                    value={changes.commissions?.bakingRewardCommission}
                    placeholder
                />
            )}
            {(sanitized.commissions?.finalizationRewardCommission !==
                undefined &&
                changes.commissions?.finalizationRewardCommission ===
                    undefined) || (
                <DisplayBakerCommission
                    title="Finalization reward commission"
                    value={changes.commissions?.finalizationRewardCommission}
                    placeholder
                />
            )}
            {(sanitized.metadataUrl !== undefined &&
                changes.metadataUrl === undefined) || (
                <DisplayMetadataUrl
                    metadataUrl={changes.metadataUrl}
                    placeholder
                />
            )}
        </>
    );
};

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL} />;

type Props = UpdateBakerPoolDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate, props.blockSummary].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withChainData(
        withExchangeRate(
            ensureProps(
                component,
                hasNecessaryProps,
                <MultiSigAccountTransactionFlowLoading
                    title={updateBakerPoolTitle}
                />
            )
        )
    );
export default withDeps(function UpdateBakerPool({
    exchangeRate,
    blockSummary: {
        updates: { chainParameters },
    },
}: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        (
            { account, ...values }: RequiredValues & UpdateBakerPoolFlowState,
            nonce: bigint
        ) =>
            convertToUpdateBakerPoolTransaction(
                account,
                nonce,
                exchangeRate,
                accountsInfo[account.address]
            )(values, values.expiry),
        [exchangeRate, accountsInfo]
    );

    return (
        <MultiSigAccountTransactionFlow<
            UpdateBakerPoolFlowState,
            ConfigureBaker
        >
            title={updateBakerPoolTitle}
            convert={convert}
            preview={(v) => (
                <DisplayValues {...v} exchangeRate={exchangeRate} />
            )}
        >
            {({ openForDelegation, account }) => ({
                openForDelegation: {
                    title: 'Pool open status',
                    render: (initial, onNext) =>
                        account ? (
                            <DelegationStatusPage
                                initial={initial}
                                onNext={onNext}
                                account={account}
                            />
                        ) : (
                            toRoot
                        ),
                },
                commissions:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              title: 'Commission rates',
                              render: (initial, onNext) =>
                                  account ? (
                                      <CommissionsPage
                                          initial={initial}
                                          onNext={onNext}
                                          chainParameters={chainParameters}
                                          account={account}
                                      />
                                  ) : (
                                      toRoot
                                  ),
                          }
                        : undefined,
                metadataUrl: {
                    title: 'Metadata URL',
                    render: (initial, onNext) =>
                        account ? (
                            <MetadataUrlPage
                                initial={initial}
                                onNext={onNext}
                                account={account}
                            />
                        ) : (
                            toRoot
                        ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
