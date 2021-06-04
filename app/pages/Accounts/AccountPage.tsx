import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PlusIcon from '@resources/svg/plus.svg';
import { push } from 'connected-react-router';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '~/components/NoIdentities';
import { accountsSelector } from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import BuildSchedule from './BuildSchedule';
import AccountPageHeader from './AccountPageHeader';
import PageLayout from '~/components/PageLayout';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function AccountsPage() {
    const dispatch = useDispatch();
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
                <PageLayout.HeaderButton
                    align="right"
                    onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
                >
                    <PlusIcon height="20" />
                </PageLayout.HeaderButton>
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
