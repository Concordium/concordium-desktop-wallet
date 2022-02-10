/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
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
import { ensureProps } from '~/utils/componentHelpers';
import routes from '~/constants/routes.json';
import {
    convertToRemoveDelegationTransaction,
    RemoveDelegationDependencies,
    RemoveDelegationFlowState,
    removeDelegationTitle,
} from '~/utils/transactionFlows/removeDelegation';
import RemoveDelegationPage from '~/components/Transfers/configureDelegation/RemoveDelegationPage';

interface Props
    extends RemoveDelegationDependencies,
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
                <AccountTransactionFlowLoading title={removeDelegationTitle} />
            )
        )
    );

export default withDeps(function RemoveDelegation(props: Props) {
    const { nonce, account, exchangeRate, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        () =>
            convertToRemoveDelegationTransaction(
                account,
                nonce,
                exchangeRate
            )(),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<RemoveDelegationFlowState, ConfigureDelegation>
            title={removeDelegationTitle}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_REMOVE_DELEGATION}
        >
            {{
                confirm: {
                    render: (_, onNext) => (
                        <RemoveDelegationPage
                            accountInfo={accountInfo}
                            onNext={onNext}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
});
