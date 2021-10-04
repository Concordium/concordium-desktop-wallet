import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { stringify } from '~/utils/JSONHelper';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import { SubmitTransferLocationState } from '../SubmitTransfer/SubmitTransfer';

import styles from './AccountDetailsPage.module.scss';

export default function RemoveBaker() {
    const account = useSelector(chosenAccountSelector);
    const dispatch = useDispatch();

    const next = useCallback(async () => {
        if (!account) {
            throw new Error('No account selected');
        }

        const { nonce } = await getNextAccountNonce(account.address);
        const transaction = await createRemoveBakerTransaction(
            account.address,
            nonce
        );

        const state: SubmitTransferLocationState = {
            account,
            transaction: stringify(transaction),
            cancelled: {
                pathname: routes.ACCOUNTS_REMOVE_BAKER,
            },
            confirmed: {
                pathname: routes.ACCOUNTS,
            },
        };

        dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
    }, [dispatch, account]);

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Remove baker</h3>
            <p className="mT30">
                This will remove the baker status of the account. After the
                grace period the full staked amount will be unlocked for
                disposal.
            </p>
            <Button onClick={next} className={styles.bakerFlowContinue}>
                Continue
            </Button>
        </Card>
    );
}
