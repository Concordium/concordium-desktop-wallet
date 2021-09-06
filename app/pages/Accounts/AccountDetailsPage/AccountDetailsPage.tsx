import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';

import AccountBalanceView from '../AccountBalanceView';
import AccountPageLayout from '../AccountPageLayout';
import AccountViewActions from '../AccountViewActions';
import BasicTransferRoutes from '../BasicTransferRoutes';
import ShowAccountAddress from '../ShowAccountAddress';
import ShowReleaseSchedule from '../ShowReleaseSchedule';
import ScheduleTransfer from '../ScheduleTransfer';
import CredentialInformation from '../CredentialInformation';
import MoreActions from './MoreActions';
import BuildSchedule from './BuildSchedule';
import TransactionLog from './TransactionLog';

const { Master, Detail } = MasterDetailPageLayout;

export default function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    if (!account || !accountInfo) {
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
                    <Route path={routes.ACCOUNTS}>
                        {/* <TransferLogFilters account={account} /> */}
                        <TransactionLog />
                    </Route>
                </BasicTransferRoutes>
            </Detail>
        </AccountPageLayout>
    );
}
