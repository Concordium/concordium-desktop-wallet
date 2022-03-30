/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import type { BlockSummaryV1 } from '@concordium/node-sdk';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
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
} from '~/utils/types';
import withChainData from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    AddBakerFlowState,
    addBakerTitle,
    convertToAddBakerTransaction,
    validateAddBakerValues,
} from '~/utils/transactionFlows/addBaker';
import {
    ConfigureBakerFlowDependencies,
    getDefaultCommissions,
} from '~/utils/transactionFlows/configureBaker';
import AddBakerStakePage from '~/components/Transfers/configureBaker/AddBakerStakePage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import routes from '~/constants/routes.json';

interface Deps
    extends ConfigureBakerFlowDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}

type Props = ExtendableProps<Deps, { blockSummary: BlockSummaryV1 }>;

type UnsafeDeps = MakeRequired<Partial<Deps>, 'account' | 'accountInfo'>;

const hasLoadedDeps = (props: UnsafeDeps): props is Deps => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Deps>) =>
    withNonce(
        withExchangeRate(
            withChainData(
                ensureProps(
                    component,
                    hasLoadedDeps,
                    <AccountTransactionFlowLoading title={addBakerTitle} />
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
    ensureDelegationProtocol(function AddBaker(props: Props) {
        const {
            nonce,
            account,
            exchangeRate,
            blockSummary,
            accountInfo,
        } = props;
        const cp = blockSummary.updates.chainParameters;

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const convert = useCallback(
            convertToAddBakerTransaction(
                getDefaultCommissions(cp),
                account,
                nonce,
                exchangeRate
            ),
            [account, nonce, exchangeRate, cp]
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const validate = useCallback(
            validateAddBakerValues(
                blockSummary,
                account,
                accountInfo,
                exchangeRate
            ),
            [blockSummary, account, accountInfo, exchangeRate]
        );

        return (
            <AccountTransactionFlow<
                AddBakerFlowState,
                ConfigureBakerTransaction
            >
                title={addBakerTitle}
                convert={convert}
                validate={validate}
                multisigRoute={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
            >
                {{
                    stake: {
                        render: (initial, onNext, formValues) => (
                            <AddBakerStakePage
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
                                account={account}
                            />
                        ),
                        title: 'Pool settings',
                    },
                    commissions: {
                        render: (initial, onNext) => (
                            <CommissionsPage
                                initial={initial}
                                onNext={onNext}
                                chainParameters={cp}
                                account={account}
                            />
                        ),
                        title: 'Pool settings',
                    },
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
                }}
            </AccountTransactionFlow>
        );
    })
);
