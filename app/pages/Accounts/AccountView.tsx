import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
} from '~/features/AccountSlice';
import {
    updateTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import routes from '~/constants/routes.json';
import MoreActions from './MoreActions';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import ShieldAmount from '~/components/Transfers/ShieldAmount';
import UnshieldAmount from '~/components/Transfers/UnshieldAmount';
import TransferHistory from './TransferHistory';
import AccountBalanceView from './AccountBalanceView';
import AccountViewActions from './AccountViewActions';
import { AccountStatus } from '~/utils/types';
import AbortController from '~/utils/AbortController';
import { noOp } from '~/utils/basicHelpers';

// milliseconds between updates of the accountInfo
const accountInfoUpdateInterval = 30000;

/**
 * Detailed view of the chosen account and its transactions.
 * Also contains controls for sending transfers.
 */
export default function AccountView() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const [controller] = useState(new AbortController());

    useEffect(() => {
        if (account) {
            updateAccountInfo(account, dispatch);
            const interval = setInterval(async () => {
                updateAccountInfo(account, dispatch);
            }, accountInfoUpdateInterval);
            return () => {
                clearInterval(interval);
            };
        }
        return noOp;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, account?.status]);

    useEffect(() => {
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            controller.isReady &&
            !controller.isAborted
        ) {
            controller.start();
            updateTransactions(dispatch, account, controller);
            return () => controller.abort();
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        accountInfo?.accountAmount,
        account?.status,
        controller.isAborted,
    ]);

    useEffect(() => {
        if (account && account.status === AccountStatus.Confirmed) {
            loadTransactions(account, dispatch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, account?.rewardFilter]);

    if (account === undefined) {
        return null;
    }

    if (accountInfo === undefined) {
        // TODO: Handle AccountInfo not available, either the account is not confirmed, or we can't reach the node.
        return null;
    }

    return (
        <>
            <AccountBalanceView />
            <AccountViewActions />
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
                <Route
                    path={routes.ACCOUNTS}
                    render={() => <TransferHistory account={account} />}
                />
            </Switch>
        </>
    );
}
