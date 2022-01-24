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
    OpenStatus,
} from '~/utils/types';
import withChainData from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    AddBakerFlowState,
    title,
    convertToTransaction,
    validateValues,
} from '~/utils/transactionFlows/addBaker';
import {
    Dependencies,
    getDefaultCommissions,
} from '~/utils/transactionFlows/configureBaker';
import StakePage from '~/components/Transfers/configureBaker/StakePage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';

type Props = Dependencies;
type UnsafeProps = MakeRequired<Partial<Props>, 'account'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withData = (component: ComponentType<Props>) =>
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

export default withData(function AddBaker(props: Props) {
    const { nonce, account, exchangeRate, blockSummary } = props;
    const accountInfo = useSelector(accountInfoSelector(account));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(
            getDefaultCommissions(),
            account,
            nonce,
            exchangeRate
        ),
        [account, nonce, exchangeRate]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validate = useCallback(
        validateValues(blockSummary, account, accountInfo, exchangeRate),
        [blockSummary, account, accountInfo, exchangeRate]
    );

    return (
        <AccountTransactionFlow<AddBakerFlowState, ConfigureBakerTransaction>
            title={title}
            convert={convert}
            validate={validate}
        >
            {({ openForDelegation }) => ({
                stake: {
                    component: (p) => (
                        <StakePage
                            {...p}
                            account={account}
                            exchangeRate={exchangeRate}
                            blockSummary={blockSummary}
                        />
                    ),
                    title: 'Stake settings',
                },
                openForDelegation: {
                    component: DelegationStatusPage,
                    title: 'Pool settings',
                },
                commissions:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              component: CommissionsPage,
                              title: 'Pool settings',
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              component: MetadataUrlPage,
                              title: 'Pool settings',
                          }
                        : undefined,
                keys: {
                    component: (p) => <KeysPage {...p} account={account} />,
                    title: 'Baker keys',
                },
            })}
        </AccountTransactionFlow>
    );
});
