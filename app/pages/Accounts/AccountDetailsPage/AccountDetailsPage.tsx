import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';

import AccountBalanceView from '../AccountBalanceView';
import AccountPageLayout from '../AccountPageLayout';
import AccountViewActions from '../AccountViewActions';
import BasicTransferRoutes from '../BasicTransferRoutes';
import ShowAccountAddress from '../ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import CredentialInformation from './CredentialInformation';
import MoreActions from './MoreActions';
import BuildSchedule from './BuildSchedule';
import TransactionLog from './TransactionLog';
import DecryptComponent from '../DecryptComponent';
import withAccountSync from '../withAccountSync';
import AddBaker from './AddBaker';

const { Master, Detail } = MasterDetailPageLayout;

export default withAccountSync(function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account) {
        return null;
    }

    return (
        <AccountPageLayout>
            <Master>
                <AccountBalanceView />
                <AccountViewActions
                    account={account}
                    accountInfo={accountInfo}
                />
                <MoreActions account={account} accountInfo={accountInfo} />
            </Master>
            <Detail>
                <BasicTransferRoutes account={account}>
                    <Route
                        path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                        component={BuildSchedule}
                    />
                    <Route path={routes.ACCOUNTS_ADDRESS}>
                        <ShowAccountAddress account={account} asCard />
                    </Route>
                    <Route path={routes.ACCOUNTS_INSPECTRELEASESCHEDULE}>
                        <ShowReleaseSchedule accountInfo={accountInfo} />
                    </Route>
                    <Route path={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER}>
                        <ScheduleTransfer account={account} />
                    </Route>
                    <Route path={routes.ACCOUNTS_CREDENTIAL_INFORMATION}>
                        <CredentialInformation
                            account={account}
                            accountInfo={accountInfo}
                        />
                    </Route>
                    <Route path={routes.ACCOUNTS_ADD_BAKER}>
                        <AddBaker />
                    </Route>
                    <Route path={routes.ACCOUNTS_REMOVE_BAKER}>
                        Remove baker
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_KEYS}>
                        Update baker keys
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                        Update baker stake
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}>
                        Update baker restake earnings
                    </Route>

                    <Route path={routes.ACCOUNTS}>
                        {viewingShielded && !account.allDecrypted ? (
                            <DecryptComponent account={account} />
                        ) : (
                            <TransactionLog />
                        )}
                    </Route>
                </BasicTransferRoutes>
            </Detail>
        </AccountPageLayout>
    );
});
