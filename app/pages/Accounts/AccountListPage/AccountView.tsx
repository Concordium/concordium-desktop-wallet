import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import MoreActions from '../MoreActions';
import EncryptedTransfer from '~/components/Transfers/EncryptedTransfer';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import ShieldAmount from '~/components/Transfers/ShieldAmount';
import UnshieldAmount from '~/components/Transfers/UnshieldAmount';
import TransferHistory from '../TransferHistory';
import AccountBalanceView from '../AccountBalanceView';
import AccountViewActions from '../AccountViewActions';
import FailedInitialAccount from '../FailedInitialAccount';

/**
 * Detailed view of the chosen account and its transactions.
 * Also contains controls for sending transfers.
 */
export default function AccountView() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

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
                    path={routes.ACCOUNTS_ENCRYPTEDTRANSFER}
                    render={() => <EncryptedTransfer account={account} />}
                />
                <Route
                    path={routes.ACCOUNTS_UNSHIELDAMOUNT}
                    render={() => <UnshieldAmount account={account} />}
                />
                <Route
                    path={routes.ACCOUNTS}
                    render={() => <TransferHistory account={account} />}
                />
            </Switch>
        </>
    );
}
