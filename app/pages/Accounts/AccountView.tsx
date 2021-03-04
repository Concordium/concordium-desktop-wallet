import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Card, Button } from 'semantic-ui-react';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '../../features/AccountSlice';
import { updateTransactions } from '../../features/TransactionSlice';
import styles from './Accounts.module.scss';
import routes from '../../constants/routes.json';
import MoreActions from './MoreActions';
import SimpleTransfer from '../../components/Transfers/SimpleTransfer';
import ShieldAmount from '../../components/Transfers/ShieldAmount';
import TransferHistory from './TransferHistory';
import AccountBalanceView from './AccountBalanceView';
import DecryptComponent from './DecryptComponent';
import { AccountStatus } from '../../utils/types';

/**
 * Detailed view of the chosen account and its transactions.
 * Also contains controls for sending transfers.
 */
export default function AccountView() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const location = useLocation();
    const buttons = [
        { route: routes.ACCOUNTS_SIMPLETRANSFER, label: 'Send' },
        { route: routes.ACCOUNTS_SHIELDAMOUNT, label: 'Shield' },
        { route: routes.ACCOUNTS_MORE, label: 'More' },
    ];

    useEffect(() => {
        if (account && account.status === AccountStatus.Confirmed) {
            updateTransactions(dispatch, account);
        }
    }, [dispatch, account]);

    if (account === undefined) {
        return null;
    }

    if (accountInfo === undefined) {
        return null; // TODO: Handle AccountInfo not available, either the account is not confirmed, or we can't reach the node.
    }

    return (
        <Card.Group itemsPerRow={1}>
            <Card>
                <AccountBalanceView />
            </Card>
            <Card>
                <Button.Group>
                    {buttons.map(({ route, label }) => (
                        <Button
                            key={route + label}
                            onClick={() => dispatch(push(route))}
                            className={styles.accountActionButton}
                            disabled={location.pathname.startsWith(route)}
                        >
                            {label}
                        </Button>
                    ))}
                </Button.Group>
            </Card>
            <Card>
                <Switch>
                    <Route
                        path={routes.ACCOUNTS_MORE}
                        render={() => (
                            <MoreActions
                                account={account}
                                accountInfo={accountInfo}
                            />
                        )}
                    />
                    <Route
                        path={routes.ACCOUNTS_SIMPLETRANSFER}
                        render={() => <SimpleTransfer account={account} />}
                    />
                    <Route
                        path={routes.ACCOUNTS_SHIELDAMOUNT}
                        render={() => <ShieldAmount account={account} />}
                    />
                    <Route path={routes.DEFAULT} component={TransferHistory} />
                </Switch>
                <DecryptComponent account={account} />
            </Card>
        </Card.Group>
    );
}
