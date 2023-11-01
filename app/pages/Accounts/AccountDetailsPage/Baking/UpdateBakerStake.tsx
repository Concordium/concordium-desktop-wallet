/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useState } from 'react';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { isDefined } from '~/utils/basicHelpers';
import {
    AccountInfo,
    ConfigureBaker as ConfigureBakerTransaction,
    MakeRequired,
    NotOptional,
} from '~/utils/types';
import withChainData from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import { ensureProps } from '~/utils/componentHelpers';
import {
    convertToBakerTransaction,
    ConfigureBakerFlowDependencies,
} from '~/utils/transactionFlows/configureBaker';
import UpdateBakerStakePage from '~/components/Transfers/configureBaker/UpdateBakerStakePage';
import routes from '~/constants/routes.json';
import {
    updateBakerStakeTitle,
    UpdateBakerStakeFlowState,
} from '~/utils/transactionFlows/updateBakerStake';
import { ValidateValues } from '~/components/MultiStepForm';
import SimpleErrorModal from '~/components/SimpleErrorModal';

interface Props
    extends ConfigureBakerFlowDependencies,
        NotOptional<AccountAndNonce> {
    accountInfo: AccountInfo;
}
type UnsafeProps = MakeRequired<Partial<Props>, 'account' | 'accountInfo'>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.chainParameters].every(
        isDefined
    );
};

const withDeps = (component: ComponentType<Props>) =>
    withNonce(
        withExchangeRate(
            withChainData(
                ensureProps(
                    component,
                    hasNecessaryProps,
                    <AccountTransactionFlowLoading
                        title={updateBakerStakeTitle}
                    />
                )
            )
        )
    );

export default withDeps(function UpdateBakerStake(props: Props) {
    const {
        nonce,
        account,
        exchangeRate,
        chainParameters,
        accountInfo,
    } = props;
    const [showError, setShowError] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        convertToBakerTransaction(account, nonce, exchangeRate, accountInfo),
        [account, nonce, exchangeRate, accountInfo]
    );

    const validate: ValidateValues<UpdateBakerStakeFlowState> = useCallback(
        (v) => {
            try {
                convert(v);
            } catch {
                setShowError(true);
                return 'stake';
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
                UpdateBakerStakeFlowState,
                ConfigureBakerTransaction
            >
                title={updateBakerStakeTitle}
                convert={convert}
                multisigRoute={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
                firstPageBack
                validate={validate}
            >
                {{
                    stake: {
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) => (
                            <UpdateBakerStakePage
                                account={account}
                                exchangeRate={exchangeRate}
                                chainParameters={chainParameters}
                                initial={initial}
                                onNext={onNext}
                                formValues={formValues}
                            />
                        ),
                    },
                }}
            </AccountTransactionFlow>
        </>
    );
});
