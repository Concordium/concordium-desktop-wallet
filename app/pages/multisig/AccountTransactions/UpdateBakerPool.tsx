/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useState } from 'react';
import { Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import {
    AccountInfoType,
    ChainParameters,
    ChainParametersV0,
} from '@concordium/web-sdk';

import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import {
    AccountInfo,
    ConfigureBaker,
    ExtendableProps,
    Fraction,
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
import { shouldShowField } from './utils';
import { ValidateValues } from '~/components/MultiStepForm';
import SimpleErrorModal from '~/components/SimpleErrorModal';

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
    const showField = shouldShowField(sanitized, changes);

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
            {showField((v) => v.openForDelegation) && (
                <PlainDetail
                    title="Pool status"
                    value={
                        changes.openForDelegation !== undefined
                            ? displayPoolOpen(changes.openForDelegation)
                            : undefined
                    }
                />
            )}
            {showField((v) => v.commissions?.transactionFeeCommission) && (
                <DisplayBakerCommission
                    title="Transaction fee commission"
                    value={changes.commissions?.transactionFeeCommission}
                    placeholder
                />
            )}
            {showField((v) => v.commissions?.bakingRewardCommission) && (
                <DisplayBakerCommission
                    title="Block reward commission"
                    subtitle="(Baking reward)"
                    value={changes.commissions?.bakingRewardCommission}
                    placeholder
                />
            )}
            {showField((v) => v.metadataUrl) && (
                <DisplayMetadataUrl
                    metadataUrl={changes.metadataUrl}
                    placeholder
                />
            )}
        </>
    );
};

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL} />;

type Deps = UpdateBakerPoolDependencies;
type Props = ExtendableProps<
    Deps,
    { chainParameters: Exclude<ChainParameters, ChainParametersV0> }
>;
type UnsafeDeps = Partial<Deps>;

const hasNecessaryProps = (props: UnsafeDeps): props is Deps =>
    [props.exchangeRate, props.chainParameters].every(isDefined);

const withDeps = (component: ComponentType<Deps>) =>
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

const ensureDelegationProtocol = (C: ComponentType<Props>) => {
    return (props: Deps) => {
        // eslint-disable-next-line react/destructuring-assignment
        if (props.chainParameters.version === 0) {
            return toRoot;
        }

        return <C {...(props as Props)} />;
    };
};

export default withDeps(
    ensureDelegationProtocol(function UpdateBakerPool({
        exchangeRate,
        chainParameters,
    }: Props) {
        const accountsInfo = useSelector(accountsInfoSelector);
        const [showError, setShowError] = useState(false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const convert = useCallback(
            (
                {
                    account,
                    ...values
                }: RequiredValues & UpdateBakerPoolFlowState,
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

        const validate: ValidateValues<
            RequiredValues & UpdateBakerPoolFlowState
        > = useCallback(
            (v) => {
                try {
                    convert(v, 0n);
                } catch {
                    setShowError(true);
                    return 'openForDelegation';
                }
                return undefined;
            },
            [convert]
        );

        return (
            <>
                <SimpleErrorModal
                    show={showError}
                    onClick={() => setShowError(false)}
                    header="Empty transaction"
                    content="Transaction includes no changes to existing validator configuration for account."
                />
                <MultiSigAccountTransactionFlow<
                    UpdateBakerPoolFlowState,
                    ConfigureBaker
                >
                    title={updateBakerPoolTitle}
                    convert={convert}
                    accountFilter={(_, i) =>
                        isDefined(i) && i.type === AccountInfoType.Baker
                    }
                    preview={(v) => (
                        <DisplayValues {...v} exchangeRate={exchangeRate} />
                    )}
                    validate={validate}
                >
                    {({ account }) => ({
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
                    })}
                </MultiSigAccountTransactionFlow>
            </>
        );
    })
);
