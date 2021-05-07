import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { Card } from 'semantic-ui-react';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '../../features/AccountSlice';
import { updateTransactions } from '../../features/TransactionSlice';
import routes from '../../constants/routes.json';
import MoreActions from './MoreActions';
import SimpleTransfer from '../../components/Transfers/SimpleTransfer';
import ShieldAmount from '../../components/Transfers/ShieldAmount';
import UnshieldAmount from '../../components/Transfers/UnshieldAmount';
import TransferHistory from './TransferHistory';
import AccountBalanceView from './AccountBalanceView';
import AccountViewActions from './AccountViewActions';
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

    useEffect(() => {
        if (account && account.status === AccountStatus.Confirmed) {
            updateTransactions(dispatch, account);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, account?.address, account?.status, account?.rewardFilter]);

    if (account === undefined) {
        return null;
    }

    if (accountInfo === undefined) {
        // TODO: Handle AccountInfo not available, either the account is not confirmed, or we can't reach the node.
        return null;
    }

    return (
        <Card.Group itemsPerRow={1}>
            <Card>
                <AccountBalanceView />
            </Card>
            <Card>
                <AccountViewActions />
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
                    <Route
                        path={routes.ACCOUNTS_UNSHIELDAMOUNT}
                        render={() => <UnshieldAmount account={account} />}
                    />
                    <Route path={routes.DEFAULT} component={TransferHistory} />
                </Switch>
                <DecryptComponent account={account} />
            </Card>
        </Card.Group>
    );
}
