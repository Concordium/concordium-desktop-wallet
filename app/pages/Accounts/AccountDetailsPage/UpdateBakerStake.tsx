import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import Form from '~/components/Form';
import Label from '~/components/Label';
import PickBakerStakeAmount from '~/components/PickBakerStakeAmount';
import {
    ensureExchangeRate,
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import routes from '~/constants/routes.json';
import {
    chosenAccountInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { getNextAccountNonce } from '~/node/nodeRequests';
import {
    ChainData,
    ensureChainData,
} from '~/pages/multisig/common/withChainData';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { displayAsGTU, microGtuToGtu, toMicroUnits } from '~/utils/gtu';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerStakeTransaction } from '~/utils/transactionHelpers';
import { EqualRecord, NotOptional, TransactionKindId } from '~/utils/types';
import { SubmitTransferLocationState } from '../SubmitTransfer/SubmitTransfer';
import { multiplyFraction } from '~/utils/basicHelpers';

import styles from './AccountDetailsPage.module.scss';
import BakerPendingChange from '~/components/BakerPendingChange';

const LoadingComponent = () => <Loading text="Loading chain data" inline />;

interface FormModel {
    stake: string;
}

const fieldNames: EqualRecord<FormModel> = {
    stake: 'stake',
};

type Props = NotOptional<ChainData> & NotOptional<ExchangeRate>;

const UpdateBakerStakeForm = ensureChainData(
    ensureExchangeRate(({ blockSummary, exchangeRate }: Props) => {
        const dispatch = useDispatch();
        const account = useSelector(chosenAccountSelector);
        const accountInfo = useSelector(chosenAccountInfoSelector);
        const estimatedFee = useTransactionCostEstimate(
            TransactionKindId.Update_baker_stake,
            exchangeRate,
            account?.signatureThreshold
        );

        const submit = useCallback(
            async ({ stake }: FormModel) => {
                if (!account) {
                    throw new Error('No account selected');
                }

                const { nonce } = await getNextAccountNonce(account.address);
                const transaction = await createUpdateBakerStakeTransaction(
                    account.address,
                    { stake: toMicroUnits(stake) },
                    nonce
                );

                transaction.estimatedFee = multiplyFraction(
                    exchangeRate,
                    transaction.energyAmount
                );

                const state: SubmitTransferLocationState = {
                    account,
                    transaction: stringify(transaction),
                    cancelled: {
                        pathname: routes.ACCOUNTS_UPDATE_BAKER_STAKE,
                    },
                    confirmed: {
                        pathname: routes.ACCOUNTS,
                    },
                };

                dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
            },
            [account, dispatch, exchangeRate]
        );

        if (!account) {
            throw new Error('No account selected');
        }

        const minimumStake = BigInt(
            blockSummary.updates.chainParameters.minimumThresholdForBaking
        );

        if (!accountInfo) {
            return <LoadingComponent />;
        }

        const pendingChange = accountInfo.accountBaker?.pendingChange;

        if (pendingChange) {
            return (
                <>
                    Cannot update baker stake becuase{' '}
                    <BakerPendingChange pending={pendingChange} />
                </>
            );
        }

        return (
            <Form<FormModel> onSubmit={submit}>
                <p className="mT30">
                    Enter your new desired amount to stake. If you raise the
                    stake it will take effect after two epochs, and if you lower
                    the stake it will take effect after the grace period.
                </p>
                {accountInfo.accountBaker?.stakedAmount && (
                    <>
                        <Label className="mT30">Current stake:</Label>
                        <em className="body2">
                            {displayAsGTU(
                                accountInfo.accountBaker?.stakedAmount
                            )}
                        </em>
                    </>
                )}
                <PickBakerStakeAmount
                    header="New stake:"
                    initial={microGtuToGtu(
                        accountInfo.accountBaker?.stakedAmount
                    )}
                    accountInfo={accountInfo}
                    fieldName={fieldNames.stake}
                    minimumStake={minimumStake}
                    estimatedFee={estimatedFee}
                />
                <Form.Submit className={styles.bakerFlowContinue}>
                    Continue
                </Form.Submit>
            </Form>
        );
    }, LoadingComponent),
    LoadingComponent
);

export default function UpdateBakerStake() {
    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Update baker stake</h3>
            <UpdateBakerStakeForm />
        </Card>
    );
}
