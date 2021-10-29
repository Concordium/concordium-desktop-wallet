import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect } from 'react-router';
import Form from '~/components/Form';
import PickBakerRestake from '~/components/PickBakerRestake';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerRestakeEarningsTransaction } from '~/utils/transactionHelpers';
import {
    Account,
    AccountInfo,
    EqualRecord,
    TransactionKindId,
} from '~/utils/types';
import { SubmitTransactionLocationState } from '../SubmitTransaction/SubmitTransaction';
import Label from '~/components/Label';
import { getEnergyToMicroGtuRate } from '~/node/nodeHelpers';
import { multiplyFraction } from '~/utils/basicHelpers';

import styles from './AccountDetailsPage.module.scss';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';

interface FormModel {
    restake: boolean;
}

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
}

const fieldNames: EqualRecord<FormModel> = {
    restake: 'restake',
};
export default function UpdateBakerRestake({ account, accountInfo }: Props) {
    const dispatch = useDispatch();

    const submit = useCallback(
        async ({ restake }: FormModel) => {
            if (!account) {
                throw new Error('No account selected');
            }

            const { nonce } = await getNextAccountNonce(account.address);
            const exchangeRate = await getEnergyToMicroGtuRate();

            const transaction = await createUpdateBakerRestakeEarningsTransaction(
                account.address,
                { restakeEarnings: restake },
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
                cancelled: {
                    pathname: routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS,
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
        [account, dispatch]
    );

    if (!account) {
        throw new Error('No account selected');
    }

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    TransactionKindId.Update_baker_restake_earnings,
                    account
                )}
            />
        );
    }

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Update baker restake earnings</h3>
            <p className="mV30">Choose to restake earnings or not, below.</p>
            <div className="mV30">
                <Label>Current restake:</Label>
                <span className="body1">
                    {accountInfo?.accountBaker?.restakeEarnings ?? true
                        ? 'Yes'
                        : 'No'}
                </span>
            </div>
            <Form<FormModel> onSubmit={submit}>
                <PickBakerRestake
                    fieldName={fieldNames.restake}
                    initial={accountInfo?.accountBaker?.restakeEarnings}
                />
                <Form.Submit className={styles.bakerFlowContinue}>
                    Continue
                </Form.Submit>
            </Form>
        </Card>
    );
}
