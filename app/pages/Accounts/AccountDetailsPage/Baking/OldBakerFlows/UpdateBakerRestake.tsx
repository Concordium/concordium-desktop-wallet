import { AccountInfoBaker } from '@concordium/node-sdk';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect } from 'react-router';
import Form from '~/components/Form';
import PickBakerRestake from '~/components/PickBakerRestake';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerRestakeEarningsTransaction } from '~/utils/transactionHelpers';
import { EqualRecord, NotOptional, TransactionKindId } from '~/utils/types';
import { SubmitTransactionLocationState } from '../../../SubmitTransaction/SubmitTransaction';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import ensureExchangeRateAndNonce, {
    ExchangeRateAndNonceProps,
} from '~/components/Transfers/ensureExchangeRateAndNonce';
import { multiplyFraction } from '~/utils/basicHelpers';

import styles from '../../AccountDetailsPage.module.scss';

interface FormModel {
    restake: boolean;
}

interface Props extends NotOptional<ExchangeRateAndNonceProps> {
    accountInfo?: AccountInfoBaker;
}

const fieldNames: EqualRecord<FormModel> = {
    restake: 'restake',
};

export default ensureExchangeRateAndNonce(function UpdateBakerRestake({
    account,
    accountInfo,
    nonce,
    exchangeRate,
}: Props) {
    const dispatch = useDispatch();

    const submit = useCallback(
        ({ restake }: FormModel) => {
            if (!account) {
                throw new Error('No account selected');
            }

            const transaction = createUpdateBakerRestakeEarningsTransaction(
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
                confirmed: {
                    pathname: routes.ACCOUNTS_FINAL_PAGE,
                    state: {
                        transaction: serialized,
                    },
                },
            };

            dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
        },
        [account, dispatch, nonce, exchangeRate]
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

    const existingValue = accountInfo?.accountBaker.restakeEarnings;

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Update baker restake earnings</h3>
            <p className="mV30">Choose to restake earnings or not, below.</p>
            <Form<FormModel> onSubmit={submit}>
                <PickBakerRestake
                    fieldName={fieldNames.restake}
                    initial={existingValue}
                    existing={existingValue}
                />
                <Form.Submit className={styles.bakerFlowContinue}>
                    Continue
                </Form.Submit>
            </Form>
        </Card>
    );
});
