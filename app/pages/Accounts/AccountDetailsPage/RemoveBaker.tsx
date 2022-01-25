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
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    title,
    convertToTransaction,
    RemoveBakerFlowState,
    Dependencies,
} from '~/utils/transactionFlows/removeBaker';
import routes from '~/constants/routes.json';
import RemoveBakerPage from '~/components/Transfers/configureBaker/RemoveBakerPage';

type Props = Dependencies;
type UnsafeProps = MakeRequired<Partial<Props>, 'account'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce].every(isDefined);
};

const withDeps = (component: ComponentType<Props>) =>
    connect((s: RootState) => ({
        account: chosenAccountSelector(s) as Account,
    }))(
        withNonce(
            withExchangeRate(
                ensureProps(
                    component,
                    hasNecessaryProps,
                    <AccountTransactionFlowLoading title={title} />
                )
            )
        )
    );

export default withDeps(function AddBaker(props: Props) {
    const { nonce, account, exchangeRate } = props;
    const accountInfo = useSelector(accountInfoSelector(account));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(account, nonce, exchangeRate),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<RemoveBakerFlowState, ConfigureBakerTransaction>
            title={title}
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
