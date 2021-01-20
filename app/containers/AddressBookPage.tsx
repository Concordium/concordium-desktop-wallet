import React from 'react';
import { Grid } from 'semantic-ui-react';
import AddressBookList from '../components/AddressBookList';
import AddressBookElementView from '../components/AddressBookElementView';

export default function AddressBookPage() {
    return (
        <Grid centered columns="equal" divided>
            <Grid.Column>
                <AddressBookList />
            </Grid.Column>
            <Grid.Column>
                <AddressBookElementView />
            </Grid.Column>
        </Grid>
    );
}
