/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import AddBakerStakePage from '~/components/Transfers/configureBaker/AddBakerStakePage';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';
import {
    AddBakerFlowState,
    convertToTransaction,
    getEstimatedFee,
    title,
    validateValues,
} from '~/utils/transactionFlows/addBaker';
import {
    Dependencies,
    getDefaultCommissions,
    displayPoolOpen,
    displayRestakeEarnings,
} from '~/utils/transactionFlows/configureBaker';
import { ConfigureBaker, Fraction, OpenStatus } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';
import routes from '~/constants/routes.json';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withChainData from '~/utils/withChainData';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import { accountsInfoSelector } from '~/features/AccountSlice';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

const PLACEHOLDER = 'To be determined';

interface DisplayProps extends Partial<AddBakerFlowState & RequiredValues> {
    exchangeRate: Fraction;
}

const DisplayValues = ({ account, exchangeRate, ...values }: DisplayProps) => {
    const withDefaults = { ...values };
    const closed = values.openForDelegation === OpenStatus.ClosedForAll;

    if (closed) {
        withDefaults.commissions = getDefaultCommissions();
        delete withDefaults.metadataUrl;
    }

    const {
        stake,
        openForDelegation,
        commissions,
        metadataUrl,
        keys,
    } = withDefaults;

    const estimatedFee =
        account !== undefined
            ? getEstimatedFee(
                  exchangeRate,
                  withDefaults,
                  account.signatureThreshold
              )
            : undefined;

    return (
        <>
            <DisplayEstimatedFee
                className={displayTransferStyles.fee}
                estimatedFee={estimatedFee}
            />
            <AmountDetail title="Staked amount" value={stake?.stake} />
            <PlainDetail
                title="Restake earnings"
                value={
                    stake?.restake !== undefined
                        ? displayRestakeEarnings(stake.restake)
                        : undefined
                }
            />
            <PlainDetail
                title="Pool delegation status"
                value={
                    openForDelegation !== undefined
                        ? displayPoolOpen(openForDelegation)
                        : undefined
                }
            />
            <DisplayBakerCommission
                title="Transaction fee commission"
                value={commissions?.transactionFeeCommission}
                placeholder={PLACEHOLDER}
            />
            <DisplayBakerCommission
                title="Baking reward commission"
                value={commissions?.bakingRewardCommission}
                placeholder={PLACEHOLDER}
            />
            <DisplayBakerCommission
                title="Finalization reward commission"
                value={commissions?.finalizationRewardCommission}
                placeholder={PLACEHOLDER}
            />
            {metadataUrl && (
                <PlainDetail title="Metadata URL" value={metadataUrl} />
            )}
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={keys?.electionPublic}
                placeholder={PLACEHOLDER}
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={keys?.signaturePublic}
                placeholder={PLACEHOLDER}
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={keys?.aggregationPublic}
                placeholder={PLACEHOLDER}
            />
        </>
    );
};

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_ADD_BAKER} />;

type Props = Omit<Dependencies, 'account' | 'nonce'>;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate, props.blockSummary].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        withChainData(
            ensureProps(
                component,
                hasNecessaryProps,
                <MultiSigAccountTransactionFlowLoading title={title} />
            )
        )
    );

export default withDeps(function AddBaker({
    exchangeRate,
    blockSummary,
}: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        (
            { account, ...values }: RequiredValues & AddBakerFlowState,
            nonce: bigint
        ) =>
            convertToTransaction(
                getDefaultCommissions(),
                account,
                nonce,
                exchangeRate
            )(values),
        [exchangeRate]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validate = useCallback(
        ({ account, ...values }: RequiredValues & AddBakerFlowState) =>
            validateValues(
                blockSummary,
                account,
                accountsInfo[account.address],
                exchangeRate
            )(values),
        [blockSummary, exchangeRate, accountsInfo]
    );

    return (
        <MultiSigAccountTransactionFlow<AddBakerFlowState, ConfigureBaker>
            title={title}
            convert={convert}
            validate={validate}
            preview={(v) => (
                <DisplayValues {...v} exchangeRate={exchangeRate} />
            )}
        >
            {({ openForDelegation, account }) => ({
                stake: {
                    title: 'Stake settings',
                    render: (initial, onNext, formValues) =>
                        account ? (
                            <AddBakerStakePage
                                account={account}
                                exchangeRate={exchangeRate}
                                blockSummary={blockSummary}
                                initial={initial}
                                onNext={onNext}
                                formValues={formValues}
                                isMultiSig
                            />
                        ) : (
                            <>{toRoot}</>
                        ),
                },
                openForDelegation: {
                    title: 'Pool settings',
                    render: (initial, onNext) => (
                        <DelegationStatusPage
                            initial={initial}
                            onNext={onNext}
                        />
                    ),
                },
                commissions:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              title: 'Pool settings',
                              render: (initial, onNext) => (
                                  <CommissionsPage
                                      initial={initial}
                                      onNext={onNext}
                                  />
                              ),
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              title: 'Pool settings',
                              render: (initial, onNext) => (
                                  <MetadataUrlPage
                                      initial={initial}
                                      onNext={onNext}
                                  />
                              ),
                          }
                        : undefined,
                keys: {
                    title: 'Generated keys',
                    render: (initial, onNext) =>
                        account ? (
                            <KeysPage
                                account={account}
                                initial={initial}
                                onNext={onNext}
                            />
                        ) : (
                            toRoot
                        ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
