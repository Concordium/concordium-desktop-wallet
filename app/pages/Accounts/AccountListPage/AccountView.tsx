import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router-dom';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';

import AccountBalanceView from '../AccountBalanceView';
import AccountViewActions from '../AccountViewActions';
import FailedInitialAccount from '../FailedInitialAccount';
import BasicTransferRoutes from '../BasicTransferRoutes';
import TransactionsAndAddress from './TransactionsAndAddress/TransactionsAndAddress';
import DecryptComponent from '../DecryptComponent';
import { viewingShieldedSelector } from '~/features/TransactionSlice';

/**
 * Detailed view of the chosen account and its transactions.
 * Also contains controls for sending transfers.
 */
export default function AccountView() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (account === undefined) {
        return null;
    }

    if (account.isInitial && accountInfo === undefined) {
        return <FailedInitialAccount account={account} />;
    }

    if (accountInfo === undefined) {
        // TODO: Handle AccountInfo not available, either the account is not confirmed, or we can't reach the node.
        return null;
    }

    return (
        <>
            <AccountBalanceView />
            <AccountViewActions account={account} accountInfo={accountInfo} />
            <BasicTransferRoutes account={account}>
                <Route path={routes.ACCOUNTS}>
                    {viewingShielded && !account.allDecrypted ? (
                        <DecryptComponent account={account} />
                    ) : (
                        <TransactionsAndAddress account={account} />
                    )}
                </Route>
            </BasicTransferRoutes>
        </>
    );
}
