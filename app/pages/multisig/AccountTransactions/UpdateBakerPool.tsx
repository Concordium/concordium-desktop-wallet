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

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';
import DisplayMetadataUrl from '~/components/Transfers/DisplayMetadataUrl';

interface DisplayProps
    extends Partial<UpdateBakerPoolFlowState & RequiredValues> {
    exchangeRate: Fraction;
}

const DisplayValues = ({ account, exchangeRate, ...values }: DisplayProps) => {
    const accountInfo: AccountInfo | undefined = useSelector(
        accountInfoSelector(account)
    );
    const sanitized = getSanitizedBakerPoolValues(values, accountInfo);
    const changes = getBakerFlowChanges(values, accountInfo);

    const { openForDelegation, commissions, metadataUrl } = changes ?? {};

    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureBakerFee(
                  sanitized,
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
                openForDelegation === undefined) || (
                <PlainDetail
                    title="Pool delegation status"
                    value={
                        openForDelegation !== undefined
                            ? displayPoolOpen(openForDelegation)
                            : undefined
                    }
                />
            )}
            {(sanitized.commissions?.transactionFeeCommission !== undefined &&
                commissions?.transactionFeeCommission === undefined) || (
                <DisplayBakerCommission
                    title="Transaction fee commission"
                    value={commissions?.transactionFeeCommission}
                    placeholder
                />
            )}
            {(sanitized.commissions?.bakingRewardCommission !== undefined &&
                commissions?.bakingRewardCommission === undefined) || (
                <DisplayBakerCommission
                    title="Baking reward commission"
                    value={commissions?.bakingRewardCommission}
                    placeholder
                />
            )}
            {(sanitized.commissions?.finalizationRewardCommission !==
                undefined &&
                commissions?.finalizationRewardCommission === undefined) || (
                <DisplayBakerCommission
                    title="Finalization reward commission"
                    value={commissions?.finalizationRewardCommission}
                    placeholder
                />
            )}
            {(sanitized.metadataUrl !== undefined &&
                metadataUrl === undefined) || (
                <DisplayMetadataUrl metadataUrl={metadataUrl} placeholder />
            )}
        </>
    );
};

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL} />;

type Props = UpdateBakerPoolDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading
                title={updateBakerPoolTitle}
            />
        )
    );

export default withDeps(function UpdateBakerPool({ exchangeRate }: Props) {
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
                    title: 'Pool settings',
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
                              title: 'Pool settings',
                              render: (initial, onNext) =>
                                  account ? (
                                      <CommissionsPage
                                          initial={initial}
                                          onNext={onNext}
                                          account={account}
                                      />
                                  ) : (
                                      toRoot
                                  ),
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              title: 'Pool settings',
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
                          }
                        : undefined,
            })}
        </MultiSigAccountTransactionFlow>
    );
});
