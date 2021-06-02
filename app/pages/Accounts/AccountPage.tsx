import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '~/components/NoIdentities';
import { accountsSelector } from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import BuildSchedule from './BuildSchedule';
import AccountPageHeader from './AccountPageHeader';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);

    if (accounts.length === 0) {
        return (
            <MasterDetailPageLayout>
                <Header>
                    <h1>Accounts</h1>
                </Header>
                <NoIdentities />
            </MasterDetailPageLayout>
        );
    }

    return (
        <MasterDetailPageLayout>
            <Header>
                <AccountPageHeader />
            </Header>
            <Master>
                <AccountList />
            </Master>
            <Detail>
                <Switch>
                    <Route
                        path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                        component={BuildSchedule}
                    />
                    <Route component={AccountView} />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
