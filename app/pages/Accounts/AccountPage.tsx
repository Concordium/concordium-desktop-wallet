import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '../../components/NoIdentities';
import { accountsSelector } from '../../features/AccountSlice';
import routes from '../../constants/routes.json';
import BuildSchedule from './BuildSchedule';

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);
    if (accounts.length === 0) {
        return <NoIdentities />;
    }
    return (
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
