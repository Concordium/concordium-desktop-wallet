/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { isChainParametersV0, ChainParametersV1 } from '@concordium/web-sdk';
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
import { ConfigureBakerFlowDependencies } from '~/utils/transactionFlows/configureBaker';
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

type Props = ExtendableProps<Deps, { chainParameters: ChainParametersV1 }>;

type UnsafeDeps = MakeRequired<Partial<Deps>, 'account' | 'accountInfo'>;

const hasLoadedDeps = (props: UnsafeDeps): props is Deps => {
    return [props.exchangeRate, props.nonce, props.chainParameters].every(
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
        (p): p is Props => !isChainParametersV0(p.chainParameters),
        <Redirect to={routes.ACCOUNTS} />
    );

export default withDeps(
    ensureDelegationProtocol(function AddBaker(props: Props) {
        const {
            nonce,
            account,
            exchangeRate,
            chainParameters,
            accountInfo,
        } = props;

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const convert = useCallback(
            convertToAddBakerTransaction(account, nonce, exchangeRate),
            [account, nonce, exchangeRate]
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const validate = useCallback(
            validateAddBakerValues(
                chainParameters,
                account,
                accountInfo,
                exchangeRate
            ),
            [chainParameters, account, accountInfo, exchangeRate]
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
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) => (
                            <AddBakerStakePage
                                account={account}
                                exchangeRate={exchangeRate}
                                chainParameters={chainParameters}
                                initial={initial}
                                onNext={onNext}
                                formValues={formValues}
                            />
                        ),
                    },
                    openForDelegation: {
                        title: 'Pool status',
                        render: (initial, onNext) => (
                            <DelegationStatusPage
                                initial={initial}
                                onNext={onNext}
                                account={account}
                            />
                        ),
                    },
                    commissions: {
                        title: 'Commission rates',
                        render: (initial, onNext) => (
                            <CommissionsPage
                                initial={initial}
                                onNext={onNext}
                                chainParameters={chainParameters}
                                account={account}
                            />
                        ),
                    },
                    metadataUrl: {
                        title: 'Metadata URL',
                        render: (initial, onNext) => (
                            <MetadataUrlPage
                                initial={initial}
                                onNext={onNext}
                                account={account}
                            />
                        ),
                    },
                    keys: {
                        title: 'Generated keys',
                        render: (initial, onNext) => (
                            <KeysPage
                                account={account}
                                initial={initial}
                                onNext={onNext}
                            />
                        ),
                    },
                }}
            </AccountTransactionFlow>
        );
    })
);
