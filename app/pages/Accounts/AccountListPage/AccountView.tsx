import React from 'react';
import { useSelector } from 'react-redux';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';

import AccountBalanceView from '../AccountBalanceView';
import AccountViewActions from '../AccountViewActions';
import FailedInitialAccount from './FailedInitialAccount';
import BasicTransferRoutes from '../BasicTransferRoutes';
import withAccountSync from '../withAccountSync';
import { AccountStatus } from '~/utils/types';

/**
 * Detailed view of the chosen account and its transactions.
 * Also contains controls for sending transfers.
 */
export default withAccountSync(function AccountView() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    if (account === undefined) {
        return null;
    }

    return (
        <>
            {account.isInitial && accountInfo === undefined && (
                <FailedInitialAccount account={account} />
            )}
            {account.status === AccountStatus.Confirmed && (
                <>
                    <AccountBalanceView />
                    <AccountViewActions
                        account={account}
                        accountInfo={accountInfo}
                    />
                    <BasicTransferRoutes account={account} />
                </>
            )}
        </>
    );
});
