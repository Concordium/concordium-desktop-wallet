/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce from '~/components/Transfers/withNonce';
import {
    accountInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { isDefined } from '~/utils/basicHelpers';
import {
    Account,
    AccountInfo,
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
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

type Props = Dependencies;
type UnsafeProps = MakeRequired<Partial<Props>, 'account'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Props>) =>
    connect((s: RootState) => ({
        account: chosenAccountSelector(s) as Account,
    }))(
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
        )
    );

export default withDeps(function UpdateBakerStake(props: Props) {
    const { nonce, account, exchangeRate, blockSummary } = props;
    const accountInfo: AccountInfo = useSelector(accountInfoSelector(account));

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
