/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { connect } from 'react-redux';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce from '~/components/Transfers/withNonce';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { isDefined } from '~/utils/basicHelpers';
import {
    Account,
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
    OpenStatus,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import { convertToTransaction } from '~/utils/transactionFlows/configureBaker';
import routes from '~/constants/routes.json';
import {
    Dependencies,
    title,
    UpdateBakerPoolFlowState,
} from '~/utils/transactionFlows/updateBakerPool';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';

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

export default withDeps(function UpdateBakerPool(props: Props) {
    const { nonce, account, exchangeRate } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(account, nonce, exchangeRate),
        [account, nonce, exchangeRate]
    );

    return (
        <AccountTransactionFlow<
            UpdateBakerPoolFlowState,
            ConfigureBakerTransaction
        >
            title={title}
            convert={convert}
            multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
        >
            {({ openForDelegation }) => ({
                openForDelegation: {
                    render: (initial, onNext) => (
                        <DelegationStatusPage
                            initial={initial}
                            onNext={onNext}
                            account={account}
                        />
                    ),
                    title: 'Pool settings',
                },
                commissions:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              render: (initial, onNext) => (
                                  <CommissionsPage
                                      initial={initial}
                                      onNext={onNext}
                                      account={account}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation !== OpenStatus.ClosedForAll
                        ? {
                              render: (initial, onNext) => (
                                  <MetadataUrlPage
                                      initial={initial}
                                      onNext={onNext}
                                      account={account}
                                  />
                              ),
                              title: 'Pool settings',
                          }
                        : undefined,
            })}
        </AccountTransactionFlow>
    );
});
