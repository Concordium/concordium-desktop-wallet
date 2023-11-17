/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useState } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { isBakerAccount } from '@concordium/web-sdk';
import { AccountInfo, ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    accountInfoSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import {
    ConfigureDelegationFlowDependencies,
    ConfigureDelegationFlowState,
    configureDelegationTitle,
    convertToConfigureDelegationTransaction,
    displayDelegationTarget,
    displayRedelegate,
    getDelegationFlowChanges,
    getEstimatedConfigureDelegationFee,
    getExistingDelegationValues,
    isPassiveDelegation,
} from '~/utils/transactionFlows/configureDelegation';
import { updateDelegationTitle } from '~/utils/transactionFlows/updateDelegation';
import { addDelegationTitle } from '~/utils/transactionFlows/addDelegation';
import DelegationTargetPage from '~/components/Transfers/configureDelegation/DelegationTargetPage';
import DelegationAmountPage from '~/components/Transfers/configureDelegation/DelegationAmountPage';
import { shouldShowField } from './utils';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { ValidateValues } from '~/components/MultiStepForm';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

import styles from './proposal-details/ProposalDetails.module.scss';

interface DisplayProps
    extends Partial<RequiredValues & ConfigureDelegationFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate, ...values }: DisplayProps) => {
    const accountInfo: AccountInfo | undefined = useSelector(
        accountInfoSelector(account)
    );
    const existingValues =
        accountInfo !== undefined
            ? getExistingDelegationValues(accountInfo)
            : undefined ?? {};
    const changes =
        existingValues !== undefined
            ? getDelegationFlowChanges(values, existingValues)
            : undefined ?? values;
    const showField = shouldShowField(values, changes);

    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureDelegationFee(
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
            {showField((v) => v.target) && (
                <PlainDetail
                    title="Delegation target"
                    value={
                        changes.target !== undefined
                            ? displayDelegationTarget(changes.target)
                            : undefined
                    }
                />
            )}
            {showField((v) => v.target) &&
                changes.target !== undefined &&
                !isPassiveDelegation(changes.target) && (
                    <p className={styles.value}>(Baker ID)</p>
                )}
            {showField((v) => v.delegate?.amount) && (
                <AmountDetail
                    title="Delegated amount"
                    value={changes.delegate?.amount}
                />
            )}
            {showField((v) => v.delegate?.redelegate) && (
                <PlainDetail
                    title="Redelegate earnings"
                    value={
                        changes.delegate?.redelegate !== undefined
                            ? displayRedelegate(changes.delegate.redelegate)
                            : undefined
                    }
                />
            )}
        </>
    );
};

type Props = ConfigureDelegationFlowDependencies & {
    isUpdate?: boolean;
};
type UnsafeProps = Partial<Props>;

const getTitle = (isUpdate: boolean) =>
    isUpdate ? updateDelegationTitle : addDelegationTitle;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate].every(isDefined);
};

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading
                title={configureDelegationTitle}
            />
        )
    );

export default withDeps(function ConfigureDelegation({
    exchangeRate,
    isUpdate = false,
}: Props) {
    const { path: matchedPath } = useRouteMatch();
    const accountsInfo = useSelector(accountsInfoSelector);
    const [showError, setShowError] = useState(false);

    const convert = useCallback(
        (
            {
                account,
                expiry,
                ...values
            }: RequiredValues & ConfigureDelegationFlowState,
            nonce: bigint
        ) =>
            convertToConfigureDelegationTransaction(
                account,
                nonce,
                exchangeRate,
                accountsInfo[account.address]
            )(values, expiry),
        [exchangeRate, accountsInfo]
    );

    const validate: ValidateValues<
        RequiredValues & ConfigureDelegationFlowState
    > = useCallback(
        (v) => {
            try {
                convert(v, 0n);
            } catch {
                setShowError(true);
                return 'target';
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
                content="Transaction includes no changes to existing delegation configuration for account."
            />
            <MultiSigAccountTransactionFlow<
                ConfigureDelegationFlowState,
                ConfigureBaker
            >
                title={getTitle(isUpdate)}
                convert={convert}
                preview={(v) => (
                    <DisplayValues {...v} exchangeRate={exchangeRate} />
                )}
                validate={validate}
                accountFilter={(_, i) => isDefined(i) && !isBakerAccount(i)}
            >
                {({ account }) => ({
                    target: {
                        title: 'Delegation target',
                        render: (initial, onNext) =>
                            isDefined(account) ? (
                                <DelegationTargetPage
                                    onNext={onNext}
                                    initial={initial}
                                    accountInfo={accountsInfo[account.address]}
                                />
                            ) : (
                                <Redirect to={matchedPath} />
                            ),
                    },
                    delegate: {
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) =>
                            isDefined(account) ? (
                                <DelegationAmountPage
                                    showAccountCard
                                    account={account}
                                    accountInfo={accountsInfo[account.address]}
                                    exchangeRate={exchangeRate}
                                    initial={initial}
                                    onNext={onNext}
                                    formValues={formValues}
                                    baseRoute={matchedPath}
                                />
                            ) : (
                                <Redirect to={matchedPath} />
                            ),
                    },
                })}
            </MultiSigAccountTransactionFlow>
        </>
    );
});
