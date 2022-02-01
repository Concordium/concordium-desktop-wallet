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
    convertToTransaction,
    Dependencies,
    title,
    UpdateBakerPoolFlowState,
} from '~/utils/transactionFlows/updateBakerPool';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';

interface Props extends Dependencies, NotOptional<AccountAndNonce> {
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
                <AccountTransactionFlowLoading title={title} />
            )
        )
    );

export default withDeps(function UpdateBakerPool(props: Props) {
    const { nonce, account, exchangeRate, accountInfo } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToTransaction(account, nonce, exchangeRate, accountInfo),
        [account, nonce, exchangeRate, accountInfo]
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
