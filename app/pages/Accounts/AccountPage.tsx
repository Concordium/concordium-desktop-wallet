import React from 'react';
import { Grid } from 'semantic-ui-react';
import AccountList from './AccountList';
import AccountView from './AccountView';

export default function AccountsPage() {
    return (
        <Grid centered columns="equal" divided>
            <Grid.Row>
                <Grid.Column>
                    <AccountList />
                </Grid.Column>
                <Grid.Column>
                    <AccountView />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
