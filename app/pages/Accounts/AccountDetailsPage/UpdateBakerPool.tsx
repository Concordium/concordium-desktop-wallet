/* eslint-disable react/display-name */
import type { BlockSummaryV1 } from '@concordium/node-sdk';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import React, { ComponentType, useCallback } from 'react';
import { Redirect } from 'react-router';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureBaker as ConfigureBakerTransaction,
    ExtendableProps,
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

interface Deps
    extends UpdateBakerPoolDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}
type Props = ExtendableProps<Deps, { blockSummary: BlockSummaryV1 }>;
type UnsafeDeps = MakeRequired<Partial<Deps>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeDeps): props is Deps => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Deps>) =>
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

const ensureDelegationProtocol = (c: ComponentType<Props>) =>
    ensureProps<Props, Deps>(
        c,
        (p): p is Props => isBlockSummaryV1(p.blockSummary),
        <Redirect to={routes.ACCOUNTS} />
    );

export default withDeps(
    ensureDelegationProtocol(function UpdateBakerPool(props: Props) {
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
                    metadataUrl: {
                        render: (initial, onNext) => (
                            <MetadataUrlPage
                                initial={initial}
                                onNext={onNext}
                                account={account}
                            />
                        ),
                        title: 'Pool settings',
                    },
                })}
            </AccountTransactionFlow>
        );
    })
);
