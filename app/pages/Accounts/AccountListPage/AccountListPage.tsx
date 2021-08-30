import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router';

import PlusIcon from '@resources/svg/plus.svg';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import PageLayout from '~/components/PageLayout';
import BuildSchedule from '~/pages/multisig/AccountTransactions/BuildSchedule';

import AccountList from '../AccountList';
import AccountPageHeader from '../AccountPageHeader';
import AccountView from './AccountView';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function ListPage() {
    const dispatch = useDispatch();

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
