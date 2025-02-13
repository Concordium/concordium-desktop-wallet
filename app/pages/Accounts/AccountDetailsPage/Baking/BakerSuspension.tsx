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
    bakerSuspensionTitle,
    convertToBakerSuspensionTransaction,
} from '~/utils/transactionFlows/bakerSuspension';
import BakerSuspensionPage from '~/components/Transfers/configureBaker/BakerSuspensionPage';

import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';

type Props = BakerSuspensionDependencies &
    NotOptional<AccountAndNonce> & {
        accountInfo: AccountInfo;
        isSuspended?: boolean;
    };

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
                <AccountTransactionFlowLoading title="Change suspension status" />
            )
        )
    );

export default withDeps(function BakerSuspension(props: Props) {
    const {
        nonce,
        account,
        exchangeRate,
        accountInfo,
        isSuspended = false,
    } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        () =>
            convertToBakerSuspensionTransaction(
                account,
                nonce,
                exchangeRate
            )(!isSuspended),
        [account, nonce, exchangeRate, isSuspended]
    );

    return (
        <AccountTransactionFlow<
            BakerSuspensionFlowState,
            ConfigureBakerTransaction
        >
            title={bakerSuspensionTitle(isSuspended)}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_SUSPENSION}
            firstPageBack
        >
            {{
                suspended: {
                    render: (_, onNext) => (
                        <BakerSuspensionPage
                            onNext={onNext}
                            accountInfo={accountInfo}
                            isSuspended={isSuspended}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
});
