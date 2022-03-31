/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useState } from 'react';
import { useRouteMatch } from 'react-router';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureDelegation,
    MakeRequired,
    NotOptional,
} from '~/utils/types';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import {
    ConfigureDelegationFlowDependencies,
    ConfigureDelegationFlowState,
    configureDelegationTitle,
    convertToConfigureDelegationTransaction,
} from '~/utils/transactionFlows/configureDelegation';
import { updateDelegationTitle } from '~/utils/transactionFlows/updateDelegation';
import { addDelegationTitle } from '~/utils/transactionFlows/addDelegation';
import { ensureProps } from '~/utils/componentHelpers';
import routes from '~/constants/routes.json';
import DelegationTargetPage from '~/components/Transfers/configureDelegation/DelegationTargetPage';
import DelegationAmountPage from '~/components/Transfers/configureDelegation/DelegationAmountPage';
import { ValidateValues } from '~/components/MultiStepForm';
import SimpleErrorModal from '~/components/SimpleErrorModal';

interface Props
    extends ConfigureDelegationFlowDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
    isUpdate?: boolean;
}

type UnsafeProps = MakeRequired<Partial<Props>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce].every(isDefined);
};

const getTitle = (isUpdate: boolean) =>
    isUpdate ? updateDelegationTitle : addDelegationTitle;

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            ensureProps(
                component,
                hasNecessaryProps,
                <AccountTransactionFlowLoading
                    title={configureDelegationTitle}
                />
            )
        )
    );

function ConfigureDelegation(props: Props) {
    const {
        nonce,
        account,
        exchangeRate,
        accountInfo,
        isUpdate = false,
    } = props;
    const { path: matchedRoute } = useRouteMatch();
    const [showError, setShowError] = useState(false);

    const multisigRoute = isUpdate
        ? routes.MULTISIGTRANSACTIONS_UPDATE_DELEGATION
        : routes.MULTISIGTRANSACTIONS_ADD_DELEGATION;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToConfigureDelegationTransaction(
            account,
            nonce,
            exchangeRate,
            accountInfo
        ),
        [account, nonce, exchangeRate, accountInfo]
    );

    const validate: ValidateValues<ConfigureDelegationFlowState> = useCallback(
        (v) => {
            try {
                convert(v);
            } catch {
                setShowError(true);
                return 'target';
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
                content="Transaction includes no changes to existing delegation configuration for account."
            />
            <AccountTransactionFlow<
                ConfigureDelegationFlowState,
                ConfigureDelegation
            >
                title={getTitle(isUpdate)}
                convert={convert}
                multisigRoute={multisigRoute}
                firstPageBack={isUpdate}
                validate={validate}
            >
                {{
                    target: {
                        title: 'Delegation target',
                        render: (initial, onNext) => (
                            <DelegationTargetPage
                                onNext={onNext}
                                initial={initial}
                                accountInfo={accountInfo}
                            />
                        ),
                    },
                    delegate: {
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) => (
                            <DelegationAmountPage
                                account={account}
                                accountInfo={accountInfo}
                                exchangeRate={exchangeRate}
                                initial={initial}
                                onNext={onNext}
                                formValues={formValues}
                                baseRoute={matchedRoute}
                            />
                        ),
                    },
                }}
            </AccountTransactionFlow>
        </>
    );
}

export default withDeps(ConfigureDelegation);
