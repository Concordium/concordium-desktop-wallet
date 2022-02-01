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
import withChainData from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    convertToTransaction,
    Dependencies,
} from '~/utils/transactionFlows/configureBaker';
import UpdateBakerStakePage from '~/components/Transfers/configureBaker/UpdateBakerStakePage';
import routes from '~/constants/routes.json';
import {
    title,
    UpdateBakerStakeFlowState,
} from '~/utils/transactionFlows/updateBakerStake';

interface Props extends Dependencies, NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}
type UnsafeProps = MakeRequired<Partial<Props>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            withChainData(
                ensureProps(
                    component,
                    hasNecessaryProps,
                    <AccountTransactionFlowLoading title={title} />
                )
            )
        )
    );

export default withDeps(function UpdateBakerStake(props: Props) {
    const { nonce, account, exchangeRate, blockSummary, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(account, nonce, exchangeRate, accountInfo),
        [account, nonce, exchangeRate, accountInfo]
    );

    return (
        <AccountTransactionFlow<
            UpdateBakerStakeFlowState,
            ConfigureBakerTransaction
        >
            title={title}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
        >
            {{
                stake: {
                    render: (initial, onNext, formValues) => (
                        <UpdateBakerStakePage
                            account={account}
                            exchangeRate={exchangeRate}
                            blockSummary={blockSummary}
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
});
