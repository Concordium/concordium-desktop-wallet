/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import {
    ChainParameters,
    ChainParametersV0,
    isChainParametersV0,
    isBakerAccount,
    isDelegatorAccount,
} from '@concordium/web-sdk';

import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import AddBakerStakePage from '~/components/Transfers/configureBaker/AddBakerStakePage';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';
import {
    AddBakerFlowState,
    convertToAddBakerTransaction,
    getEstimatedAddBakerFee,
    getSanitizedAddBakerValues,
    addBakerTitle,
    validateAddBakerValues,
} from '~/utils/transactionFlows/addBaker';
import {
    ConfigureBakerFlowDependencies,
    displayPoolOpen,
    displayRestakeEarnings,
} from '~/utils/transactionFlows/configureBaker';
import { ConfigureBaker, ExtendableProps, Fraction } from '~/utils/types';
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
import DisplayMetadataUrl from '~/components/Transfers/DisplayMetadataUrl';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps extends Partial<AddBakerFlowState & RequiredValues> {
    exchangeRate: Fraction;
    chainParameters: Exclude<ChainParameters, ChainParametersV0>;
}

const DisplayValues = ({
    account,
    exchangeRate,
    chainParameters,
    ...values
}: DisplayProps) => {
    const sanitized = getSanitizedAddBakerValues(values);

    const {
        stake,
        openForDelegation,
        commissions,
        metadataUrl,
        keys,
    } = sanitized;

    const estimatedFee =
        account !== undefined
            ? getEstimatedAddBakerFee(
                  exchangeRate,
                  sanitized,
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
                title="Pool status"
                value={
                    openForDelegation !== undefined
                        ? displayPoolOpen(openForDelegation)
                        : undefined
                }
            />
            <DisplayBakerCommission
                title="Transaction fee commission"
                value={commissions?.transactionFeeCommission}
                placeholder
            />
            <DisplayBakerCommission
                title="Block reward commission"
                subtitle="(Baking reward)"
                value={commissions?.bakingRewardCommission}
                placeholder
            />
            <DisplayBakerCommission
                title="Finalization reward commission"
                subtitle="(Deprecated value)"
                value={commissions?.finalizationRewardCommission}
                placeholder
            />
            <DisplayMetadataUrl metadataUrl={metadataUrl} placeholder />
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={keys?.electionPublic}
                placeholder
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={keys?.signaturePublic}
                placeholder
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={keys?.aggregationPublic}
                placeholder
            />
        </>
    );
};

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_ADD_BAKER} />;

type Deps = ConfigureBakerFlowDependencies;
type Props = ExtendableProps<
    Deps,
    { chainParameters: Exclude<ChainParameters, ChainParametersV0> }
>;
type UnsafeDeps = Partial<Deps>;

const hasNecessaryProps = (props: UnsafeDeps): props is Deps =>
    [props.exchangeRate, props.chainParameters].every(isDefined);

const withDeps = (component: ComponentType<Deps>) =>
    withExchangeRate(
        withChainData(
            ensureProps(
                component,
                hasNecessaryProps,
                <MultiSigAccountTransactionFlowLoading title={addBakerTitle} />
            )
        )
    );

const ensureDelegationProtocol = (c: ComponentType<Props>) =>
    ensureProps<Props, Deps>(
        c,
        (p): p is Props => !isChainParametersV0(p.chainParameters),
        toRoot
    );

export default withDeps(
    ensureDelegationProtocol(function AddBaker({
        exchangeRate,
        chainParameters,
    }: Props) {
        const accountsInfo = useSelector(accountsInfoSelector);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const convert = useCallback(
            (
                { account, ...values }: RequiredValues & AddBakerFlowState,
                nonce: bigint
            ) =>
                convertToAddBakerTransaction(
                    account,
                    nonce,
                    exchangeRate
                )(values, values.expiry),
            [exchangeRate, chainParameters]
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const validate = useCallback(
            ({ account, ...values }: RequiredValues & AddBakerFlowState) =>
                validateAddBakerValues(
                    chainParameters,
                    account,
                    accountsInfo[account.address],
                    exchangeRate
                )(values),
            [chainParameters, exchangeRate, accountsInfo]
        );

        return (
            <MultiSigAccountTransactionFlow<AddBakerFlowState, ConfigureBaker>
                title={addBakerTitle}
                convert={convert}
                validate={validate}
                accountFilter={(_, i) =>
                    isDefined(i) && !isBakerAccount(i) && !isDelegatorAccount(i)
                }
                preview={(v) => (
                    <DisplayValues
                        {...v}
                        exchangeRate={exchangeRate}
                        chainParameters={chainParameters}
                    />
                )}
            >
                {({ account }) => ({
                    stake: {
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) =>
                            account ? (
                                <AddBakerStakePage
                                    account={account}
                                    exchangeRate={exchangeRate}
                                    chainParameters={chainParameters}
                                    initial={initial}
                                    onNext={onNext}
                                    formValues={formValues}
                                    isMultiSig
                                />
                            ) : (
                                toRoot
                            ),
                    },
                    openForDelegation: {
                        title: 'Pool status',
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
                    commissions: {
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
                    },
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
    })
);
