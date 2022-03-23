/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
    NotOptional,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import { convertToBakerTransaction } from '~/utils/transactionFlows/configureBaker';
import routes from '~/constants/routes.json';
import {
    UpdateBakerKeysDependencies,
    updateBakerKeysTitle,
    UpdateBakerKeysFlowState,
} from '~/utils/transactionFlows/updateBakerKeys';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';

type Props = UpdateBakerKeysDependencies & NotOptional<AccountAndNonce>;
type UnsafeProps = MakeRequired<Partial<Props>, 'account'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce].every(isDefined);
};

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            ensureProps(
                component,
                hasNecessaryProps,
                <AccountTransactionFlowLoading title={updateBakerKeysTitle} />
            )
        )
    );

export default withDeps(function UpdateBakerKeys(props: Props) {
    const { nonce, account, exchangeRate } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToBakerTransaction(account, nonce, exchangeRate),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<
            UpdateBakerKeysFlowState,
            ConfigureBakerTransaction
        >
            title={updateBakerKeysTitle}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_KEYS}
            firstPageBack
        >
            {{
                keys: {
                    render: (initial, onNext) => (
                        <KeysPage
                            account={account}
                            initial={initial}
                            onNext={onNext}
                        />
                    ),
                    title: 'Generated keys',
                },
            }}
        </AccountTransactionFlow>
    );
});
