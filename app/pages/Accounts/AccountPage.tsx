import React from 'react';
import { Grid } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '../../components/NoIdentities';
import { accountsSelector } from '../../features/AccountSlice';

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
                    <AccountView />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
