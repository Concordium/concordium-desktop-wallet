import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import AccountList from './AccountList';
import AccountView from './AccountView';
import BuildSchedule from './BuildSchedule';

export default function AccountsPage() {
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
