import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import Form from '~/components/Form';
import PickBakerRestake from '~/components/PickBakerRestake';
import Card from '~/cross-app-components/Card';
import {
    chosenAccountInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { stringify } from '~/utils/JSONHelper';
import { createUpdateBakerRestakeEarningsTransaction } from '~/utils/transactionHelpers';
import { EqualRecord } from '~/utils/types';
import { SubmitTransferLocationState } from '../SubmitTransfer/SubmitTransfer';

import styles from './AccountDetailsPage.module.scss';

interface FormModel {
    restake: boolean;
}

const fieldNames: EqualRecord<FormModel> = {
    restake: 'restake',
};
export default function UpdateBakerRestake() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    const submit = useCallback(
        async ({ restake }: FormModel) => {
            if (!account) {
                throw new Error('No account selected');
            }

            const { nonce } = await getNextAccountNonce(account.address);
            const transaction = await createUpdateBakerRestakeEarningsTransaction(
                account.address,
                { restakeEarnings: restake },
                nonce
            );

            const state: SubmitTransferLocationState = {
                account,
                transaction: stringify(transaction),
                cancelled: {
                    pathname: routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS,
                },
                confirmed: {
                    pathname: routes.ACCOUNTS,
                },
            };

            dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
        },
        [account, dispatch]
    );

    if (!account) {
        throw new Error('No account selected');
    }

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Update baker stake</h3>
            <p className="mV30">Choose to restake earnings or not, below.</p>
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
