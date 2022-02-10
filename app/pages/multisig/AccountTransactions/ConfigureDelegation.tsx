/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
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

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';
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
} from '~/utils/transactionFlows/configureDelegation';
import DelegationTargetPage from '~/components/Transfers/configureDelegation/DelegationTargetPage';
import DelegationAmountPage from '~/components/Transfers/configureDelegation/DelegationAmountPage';

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
            {(values.target !== undefined && changes.target === undefined) || (
                <PlainDetail
                    title="Delegation target"
                    value={
                        changes.target !== undefined
                            ? displayDelegationTarget(changes.target)
                            : undefined
                    }
                />
            )}
            {(values.delegate?.amount !== undefined &&
                changes.delegate?.amount === undefined) || (
                <AmountDetail
                    title="Delegated amount"
                    value={changes.delegate?.amount}
                />
            )}
            {(values.delegate?.redelegate !== undefined &&
                changes.delegate?.redelegate === undefined) || (
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

type Props = ConfigureDelegationFlowDependencies;
type UnsafeProps = Partial<Props>;

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

export default withDeps(function ConfigureDelegation({ exchangeRate }: Props) {
    const { path: matchedPath } = useRouteMatch();
    const accountsInfo = useSelector(accountsInfoSelector);

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

    return (
        <MultiSigAccountTransactionFlow<
            ConfigureDelegationFlowState,
            ConfigureBaker
        >
            title={configureDelegationTitle}
            convert={convert}
            preview={(v) => (
                <DisplayValues {...v} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                target: {
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
                    title: 'Delegation target',
                },
                delegate: {
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
                    title: 'Delegation settings',
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
