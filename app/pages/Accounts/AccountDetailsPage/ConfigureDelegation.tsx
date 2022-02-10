/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { useRouteMatch } from 'react-router';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureDelegation,
    MakeRequired,
    NotOptional,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import {
    ConfigureDelegationFlowDependencies,
    ConfigureDelegationFlowState,
    configureDelegationTitle,
    convertToConfigureDelegationTransaction,
    getExistingDelegationValues,
} from '~/utils/transactionFlows/configureDelegation';
import { ensureProps } from '~/utils/componentHelpers';
import routes from '~/constants/routes.json';
import DelegationTargetPage from '~/components/Transfers/configureDelegation/DelegationTargetPage';
import DelegationAmountPage from '~/components/Transfers/configureDelegation/DelegationAmountPage';
import { microGTUPerGTU } from '~/utils/gtu';

interface Props
    extends ConfigureDelegationFlowDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}

type UnsafeProps = MakeRequired<Partial<Props>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce].every(isDefined);
};

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            ensureProps(
                component,
                hasNecessaryProps,
                <AccountTransactionFlowLoading
                    title={configureDelegationTitle}
                />
            )
        )
    );

function ConfigureDelegation(props: Props) {
    const { nonce, account, exchangeRate, accountInfo } = props;
    const { target } = getExistingDelegationValues(accountInfo) ?? {};
    const { path: matchedRoute } = useRouteMatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToConfigureDelegationTransaction(
            account,
            nonce,
            exchangeRate,
            accountInfo
        ),
        [account, nonce, exchangeRate, accountInfo]
    );

    return (
        <AccountTransactionFlow<
            ConfigureDelegationFlowState,
            ConfigureDelegation
        >
            title={configureDelegationTitle}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_CONFIGURE_DELEGATION}
        >
            {{
                target: {
                    render: (initial, onNext) => (
                        <DelegationTargetPage
                            onNext={onNext}
                            initial={initial}
                            existing={target}
                        />
                    ),
                },
                delegate: {
                    render: (initial, onNext, formValues) => (
                        <DelegationAmountPage
                            account={account}
                            accountInfo={accountInfo}
                            maxDelegationAmount={BigInt(10000) * microGTUPerGTU} // TODO revise.
                            exchangeRate={exchangeRate}
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                            baseRoute={matchedRoute}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}

export default withDeps(ConfigureDelegation);
