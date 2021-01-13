import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Switch, Route, useLocation } from 'react-router-dom';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '../features/AccountSlice';
import styles from './Accounts.css';
import routes from '../constants/routes.json';
import moreActions from './MoreActions';
import simpleTransfer from './SimpleTransfer';
import transferHistory from './TransferHistory';
import AccountBalanceView from './AccountBalanceView';
import DecryptComponent from './DecryptComponent';

export default function AccountView() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const location = useLocation();

    if (account === undefined) {
        return <div />;
    }
    return (
        <div className={styles.halfPage}>
            <AccountBalanceView />
            <span className={styles.accountActionsSpan}>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button
                        className={`${styles.accountActionButton} ${
                            location.pathname.startsWith(
                                routes.ACCOUNTS_SIMPLETRANSFER
                            )
                                ? styles.accountActionButtonHighlighted
                                : ''
                        }`}
                        type="button"
                    >
                        Send
                    </button>
                </Link>
                <Link to={routes.ACCOUNTS_SIMPLETRANSFER}>
                    <button
                        className={`${styles.accountActionButton} ${
                            location.pathname.startsWith(
                                routes.ACCOUNTS_SIMPLETRANSFER
                            )
                                ? styles.accountActionButtonHighlighted
                                : ''
                        }`}
                        type="button"
                    >
                        Shield
                    </button>
                </Link>
                <Link to={routes.ACCOUNTS_MORE}>
                    <button
                        className={`${styles.accountActionButton} ${
                            location.pathname.startsWith(routes.ACCOUNTS_MORE)
                                ? styles.accountActionButtonHighlighted
                                : ''
                        }`}
                        type="button"
                    >
                        More
                    </button>
                </Link>
            </span>
            <Switch>
                <Route
                    path={routes.ACCOUNTS_MORE}
                    component={() => moreActions(account, accountInfo)}
                />
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
