import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '../../components/NoIdentities';
import { accountsSelector } from '../../features/AccountSlice';
import PageHeader from '../../components/PageHeader';
import BuildSchedule from './BuildSchedule';
import routes from '../../constants/routes.json';

import PlusIcon from '../../../resources/svg/plus.svg';

export default function AccountsPage() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    let body;
    if (accounts.length === 0) {
        body = <NoIdentities />;
    } else {
        body = (
            <Grid centered columns="equal" divided>
                <Grid.Row>
                    <Grid.Column>
                        <AccountList />
                    </Grid.Column>
                    <Grid.Column>
                        <Switch>
                            <Route
                                path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                                component={BuildSchedule}
                            />
                            <Route component={AccountView} />
                        </Switch>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }

    return (
        <>
            <PageHeader>
                <h1>Accounts</h1>
                <PageHeader.Button
                    align="right"
                    onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
                >
                    <PlusIcon />
                </PageHeader.Button>
            </PageHeader>
            {body}
        </>
    );
}
