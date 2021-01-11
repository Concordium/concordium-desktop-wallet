import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import {
    chosenAccountSelector,
    accountsInfoSelector,
} from '../features/AccountSlice';
import styles from './Accounts.css';
import routes from '../constants/routes.json';
import simpleTransfer from './SimpleTransfer';
import transferHistory from './TransferHistory';
import AccountBalanceView from './AccountBalanceView';
import DecryptComponent from './DecryptComponent';

export default function AccountView() {
    const account = useSelector(chosenAccountSelector);
    const accountsInfo = useSelector(accountsInfoSelector);

    if (account === undefined) {
        return <div />;
    }
    return (
        <div className={styles.halfPage}>
            <AccountBalanceView
                account={account}
                accountInfo={accountsInfo[account.address]}
            />
            <span className={styles.accountActionsSpan}>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button type="button">Send</button>
                </Link>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button type="button">Shield</button>
                </Link>
            </span>
            <Switch>
                <Route
                    path={routes.ACCOUNTS_SIMPLETRANSFER}
                    component={() => simpleTransfer(account)}
                />
                <Route
                    path={routes.DEFAULT}
                    component={() => transferHistory(account)}
                />
            </Switch>
            <DecryptComponent account={account} />
        </div>
    );
}
