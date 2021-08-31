import React from 'react';
import { Route, Switch } from 'react-router';

import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import BuildSchedule from '~/pages/multisig/AccountTransactions/BuildSchedule';

import AccountList from '../AccountList';
import AccountView from './AccountView';
import AccountPageLayout from '../AccountPageLayout';

const { Master, Detail } = MasterDetailPageLayout;

export default function ListPage() {
    return (
        <AccountPageLayout>
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
        </AccountPageLayout>
    );
}
