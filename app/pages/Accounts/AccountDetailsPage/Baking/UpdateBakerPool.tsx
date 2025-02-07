/* eslint-disable react/display-name */
import type { ChainParametersV1 } from '@concordium/web-sdk';
import React, { ComponentType, useCallback, useState } from 'react';
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
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
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
import { ValidateValues } from '~/components/MultiStepForm';
import SimpleErrorModal from '~/components/SimpleErrorModal';

interface Deps
    extends UpdateBakerPoolDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}

type Props = ExtendableProps<Deps, { chainParameters: ChainParametersV1 }>;
type UnsafeDeps = MakeRequired<Partial<Deps>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeDeps): props is Deps => {
    return [props.exchangeRate, props.nonce, props.chainParameters].every(
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

const ensureDelegationProtocol = (C: ComponentType<Props>) => {
    return (props: Deps) => {
        // eslint-disable-next-line react/destructuring-assignment
        if (props.chainParameters.version === 0) {
            return <Redirect to={routes.ACCOUNTS} />;
        }

        return <C {...(props as Props)} />;
    };
};

export default withDeps(
    ensureDelegationProtocol(function UpdateBakerPool(props: Props) {
        const {
            nonce,
            account,
            exchangeRate,
            accountInfo,
            chainParameters,
        } = props;
        const [showError, setShowError] = useState(false);

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

        const validate: ValidateValues<UpdateBakerPoolFlowState> = useCallback(
            (v) => {
                try {
                    convert(v);
                } catch {
                    setShowError(true);
                    return 'openForDelegation';
                }
                return undefined;
            },
            [convert]
        );

        return (
            <>
                <SimpleErrorModal
                    show={showError}
                    onClick={() => setShowError(false)}
                    header="Empty transaction"
                    content="Transaction includes no changes to existing validator configuration for account."
                />
                <AccountTransactionFlow<
                    UpdateBakerPoolFlowState,
                    ConfigureBakerTransaction
                >
                    title={updateBakerPoolTitle}
                    convert={convert}
                    multisigRoute={
                        routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL
                    }
                    firstPageBack
                    validate={validate}
                >
                    {{
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
                    }}
                </AccountTransactionFlow>
            </>
        );
    })
);
