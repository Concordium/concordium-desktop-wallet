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
} from '../AccountTransactionFlow';
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
import routes from '~/constants/routes.json';

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

export default withDeps(function AddBaker(props: Props) {
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
            multisigRoute={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
        >
            {({ openForDelegation }) => ({
                stake: {
                    render: (initial, onNext, formValues) => (
                        <StakePage
                            account={account}
                            exchangeRate={exchangeRate}
                            blockSummary={blockSummary}
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                        />
                    ),
                },
                openForDelegation: {
                    render: (initial, onNext) => (
                        <DelegationStatusPage
                            initial={initial}
                            onNext={onNext}
                        />
                    ),
                    title: 'Pool settings',
                },
                commissions:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              render: (initial, onNext) => (
                                  <CommissionsPage
                                      initial={initial}
                                      onNext={onNext}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              render: (initial, onNext) => (
                                  <MetadataUrlPage
                                      initial={initial}
                                      onNext={onNext}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
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
            })}
        </AccountTransactionFlow>
    );
});
