import React from 'react';
import { Grid } from 'semantic-ui-react';
import AccountList from '../components/AccountList';
import AccountView from '../components/AccountView';

export default function AccountsPage() {
    return (
        <Grid container columns={2} divided>
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
