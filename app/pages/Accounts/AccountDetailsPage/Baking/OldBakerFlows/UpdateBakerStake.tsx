import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { goBack, push } from 'connected-react-router';
import { Redirect } from 'react-router';
import { isBakerAccount } from '@concordium/common-sdk/lib/accountHelpers';
import Form from '~/components/Form';
import PickBakerStakeAmount from '~/components/PickBakerStakeAmount';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import routes from '~/constants/routes.json';
import {
    chosenAccountInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { ChainData, ensureChainData } from '~/utils/withChainData';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerStakeTransaction } from '~/utils/transactionHelpers';
import {
    AccountInfo,
    EqualRecord,
    NotOptional,
    TransactionKindId,
} from '~/utils/types';
import { SubmitTransactionLocationState } from '../../../SubmitTransaction/SubmitTransaction';
import { multiplyFraction } from '~/utils/basicHelpers';
import StakePendingChange from '~/components/StakePendingChange';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import ensureExchangeRateAndNonce, {
    ExchangeRateAndNonceProps,
} from '~/components/Transfers/ensureExchangeRateAndNonce';
import BackButton from '~/cross-app-components/BackButton';
import { ccdToMicroCcd, microCcdToCcd } from '~/utils/ccd';

import styles from '../../AccountDetailsPage.module.scss';
import { getMinimumStakeForBaking } from '~/utils/blockSummaryHelpers';

const LoadingComponent = () => <Loading text="Loading chain data" inline />;

interface FormModel {
    stake: string;
}

interface Props
    extends NotOptional<ExchangeRateAndNonceProps>,
        NotOptional<ChainData> {
    accountInfo?: AccountInfo;
}

const fieldNames: EqualRecord<FormModel> = {
    stake: 'stake',
};

const UpdateBakerStakeForm = ensureExchangeRateAndNonce(
    ensureChainData(({ chainParameters, exchangeRate, nonce }: Props) => {
        const dispatch = useDispatch();
        const account = useSelector(chosenAccountSelector);
        const accountInfo = useSelector(chosenAccountInfoSelector);
        const estimatedFee = useTransactionCostEstimate(
            TransactionKindId.Update_baker_stake,
            exchangeRate,
            account?.signatureThreshold
        );

        const submit = useCallback(
            ({ stake }: FormModel) => {
                if (!account) {
                    throw new Error('No account selected');
                }

                const transaction = createUpdateBakerStakeTransaction(
                    account.address,
                    { stake: ccdToMicroCcd(stake) },
                    nonce
                );

                transaction.estimatedFee = multiplyFraction(
                    exchangeRate,
                    transaction.energyAmount
                );
                const serialized = stringify(transaction);
                const state: SubmitTransactionLocationState = {
                    account,
                    transaction: serialized,
                    confirmed: {
                        pathname: routes.ACCOUNTS_FINAL_PAGE,
                        state: {
                            transaction: serialized,
                        },
                    },
                };

                dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
            },
            [account, dispatch, exchangeRate, nonce]
        );

        if (!account) {
            throw new Error('No account selected');
        }

        if (isMultiSig(account)) {
            return (
                <Redirect
                    to={createTransferWithAccountRoute(
                        TransactionKindId.Update_baker_stake,
                        account
                    )}
                />
            );
        }

        const minimumStake = BigInt(getMinimumStakeForBaking(chainParameters));

        if (!accountInfo) {
            return <LoadingComponent />;
        }

        if (!isBakerAccount(accountInfo)) {
            return <Redirect to={routes.ACCOUNTS} />;
        }

        const { pendingChange } = accountInfo.accountBaker;

        if (pendingChange) {
            return (
                <p className="mT30 mB0">
                    Cannot update baker stake at this time:
                    <div className="bodyEmphasized textError mV10">
                        <StakePendingChange pending={pendingChange} />
                    </div>
                    It will be possible to proceed after this time has passed.
                </p>
            );
        }

        const existingValue = microCcdToCcd(
            accountInfo.accountBaker?.stakedAmount
        );

        return (
            <Form<FormModel> onSubmit={submit}>
                <div className="body2 mT30">
                    Enter your new desired amount to stake. If you raise the
                    stake it will take effect after two epochs, and if you lower
                    the stake it will take effect after the grace period.
                </div>
                <PickBakerStakeAmount
                    header="New stake:"
                    initial={existingValue}
                    accountInfo={accountInfo}
                    fieldName={fieldNames.stake}
                    minimumStake={minimumStake}
                    estimatedFee={estimatedFee}
                    existing={existingValue}
                />
                <Form.Submit className={styles.bakerFlowContinue}>
                    Continue
                </Form.Submit>
            </Form>
        );
    }, LoadingComponent)
);

export default function UpdateBakerStake(
    props: Pick<Props, 'account' | 'accountInfo'>
) {
    const dispatch = useDispatch();

    return (
        <Card className="textCenter pB40 relative">
            <BackButton
                className={styles.backButton}
                onClick={() => dispatch(goBack())}
            />
            <h3 className="bodyEmphasized mT0">Update baker stake</h3>
            <UpdateBakerStakeForm {...props} />
        </Card>
    );
}
