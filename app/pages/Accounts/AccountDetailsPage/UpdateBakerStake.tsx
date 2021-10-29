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
import {
    useCalcBakerStakeCooldownUntil,
    useTransactionCostEstimate,
} from '~/utils/dataHooks';
import { displayAsGTU, microGtuToGtu, toMicroUnits } from '~/utils/gtu';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerStakeTransaction } from '~/utils/transactionHelpers';
import {
    Account,
    AccountInfo,
    EqualRecord,
    NotOptional,
    TransactionKindId,
} from '~/utils/types';
import { SubmitTransferLocationState } from '../SubmitTransfer/SubmitTransfer';
import { multiplyFraction } from '~/utils/basicHelpers';

import styles from './AccountDetailsPage.module.scss';
import BakerPendingChange from '~/components/BakerPendingChange';
import { getFormattedDateString } from '~/utils/timeHelpers';

const LoadingComponent = () => <Loading text="Loading chain data" inline />;

interface FormModel {
    stake: string;
}

interface Props extends NotOptional<ChainData>, NotOptional<ExchangeRate> {
    account: Account;
    accountInfo?: AccountInfo;
}

const fieldNames: EqualRecord<FormModel> = {
    stake: 'stake',
};

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
        const cooldownUntil = useCalcBakerStakeCooldownUntil();

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
                const serialized = stringify(transaction);
                const state: SubmitTransferLocationState = {
                    account,
                    transaction: serialized,
                    cancelled: {
                        pathname: routes.ACCOUNTS_UPDATE_BAKER_STAKE,
                    },
                    confirmed: {
                        pathname: routes.ACCOUNTS_FINAL_PAGE,
                        state: {
                            transaction: serialized,
                        },
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
                <p className="mT30 mB0">
                    Cannot update baker stake at this time:
                    <div className="bodyEmphasized textError mV10">
                        <BakerPendingChange pending={pendingChange} />
                    </div>
                    It will be possible to proceed after this time has passed.
                </p>
            );
        }

        return (
            <Form<FormModel> onSubmit={submit}>
                <p className="mT30">
                    Enter your new desired amount to stake. If you raise the
                    stake it will take effect after two epochs, and if you lower
                    the stake it will take effect after the grace period.
                    {cooldownUntil && (
                        <>
                            This grace period will last until
                            <div className="bodyEmphasized  mV10">
                                {getFormattedDateString(cooldownUntil)}
                            </div>
                            and the baker stake will be frozen in this period.
                        </>
                    )}
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

export default function UpdateBakerStake(
    props: Pick<Props, 'account' | 'accountInfo'>
) {
    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Update baker stake</h3>
            <UpdateBakerStakeForm {...props} />
        </Card>
    );
}
