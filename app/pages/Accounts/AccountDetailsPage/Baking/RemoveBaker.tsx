/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
    NotOptional,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    removeBakerTitle,
    convertToRemoveBakerTransaction,
    RemoveBakerFlowState,
    RemoveBakerDependencies,
} from '~/utils/transactionFlows/removeBaker';
import routes from '~/constants/routes.json';
import RemoveBakerPage from '~/components/Transfers/configureBaker/RemoveBakerPage';

interface Props extends RemoveBakerDependencies, NotOptional<AccountAndNonce> {
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
                <AccountTransactionFlowLoading title={removeBakerTitle} />
            )
        )
    );

export default withDeps(function RemoveBaker(props: Props) {
    const { nonce, account, exchangeRate, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        () => convertToRemoveBakerTransaction(account, nonce, exchangeRate)(),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<RemoveBakerFlowState, ConfigureBakerTransaction>
            title={removeBakerTitle}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_REMOVE_BAKER}
        >
            {{
                confirm: {
                    render: (_, onNext) => (
                        <RemoveBakerPage
                            onNext={onNext}
                            accountInfo={accountInfo}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
});
