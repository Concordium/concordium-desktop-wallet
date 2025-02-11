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
import { ensureProps } from '~/utils/componentHelpers';
import routes from '~/constants/routes.json';
import {
    BakerSuspensionDependencies,
    BakerSuspensionFlowState,
    convertToBakerSuspensionTransaction,
} from '~/utils/transactionFlows/bakerSuspension';

import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';

interface Props
    extends BakerSuspensionDependencies,
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
                <AccountTransactionFlowLoading title={removeBakerTitle} />
            )
        )
    );

export default withDeps(function BakerSuspension(props: Props) {
    const { nonce, account, exchangeRate, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        () =>
            convertToBakerSuspensionTransaction(account, nonce, exchangeRate)(),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<
            BakerSuspensionFlowState,
            ConfigureBakerTransaction
        >
            title={removeBakerTitle}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_SUSPENSION}
            firstPageBack
        >
            {{
                confirm: {
                    render: (_, onNext) => (
                        <BakerSuspensionPage
                            onNext={onNext}
                            accountInfo={accountInfo}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
});
