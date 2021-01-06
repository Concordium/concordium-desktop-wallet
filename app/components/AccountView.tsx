import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import { chosenAccountSelector } from '../features/AccountSlice';
import styles from './Accounts.css';
import routes from '../constants/routes.json';
import simpleTransfer from './SimpleTransfer';
import transferHistory from './TransferHistory';

export default function AccountView() {
    const account = useSelector(chosenAccountSelector);

    if (account === undefined) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
                {' '}
                {account.name} {account.address}{' '}
            </div>
            <span className={styles.accountActionsSpan}>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button>Send</button>
                </Link>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button>Shield</button>
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
        </div>
    );
}
