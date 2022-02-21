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
    OpenStatus,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import routes from '~/constants/routes.json';
import {
    convertToUpdateBakerPoolTransaction,
    UpdateBakerPoolDependencies,
    updateBakerPoolTitle,
    UpdateBakerPoolFlowState,
} from '~/utils/transactionFlows/updateBakerPool';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import withChainData from '~/utils/withChainData';

interface Props
    extends UpdateBakerPoolDependencies,
        NotOptional<AccountAndNonce> {
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
        withChainData(
            withExchangeRate(
                ensureProps(
                    component,
                    hasNecessaryProps,
                    <AccountTransactionFlowLoading
                        title={updateBakerPoolTitle}
                    />
                )
            )
        )
    );

export default withDeps(function UpdateBakerPool(props: Props) {
    const {
        nonce,
        account,
        exchangeRate,
        accountInfo,
        blockSummary: {
            updates: { chainParameters },
        },
    } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToUpdateBakerPoolTransaction(
            account,
            nonce,
            exchangeRate,
            accountInfo
        ),
        [account, nonce, exchangeRate, accountInfo]
    );

    return (
        <AccountTransactionFlow<
            UpdateBakerPoolFlowState,
            ConfigureBakerTransaction
        >
            title={updateBakerPoolTitle}
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
                                      chainParameters={chainParameters}
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
