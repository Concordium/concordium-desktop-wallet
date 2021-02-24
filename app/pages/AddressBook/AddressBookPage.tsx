import React from 'react';
import { Grid } from 'semantic-ui-react';
import AddressBookList from './AddressBookList';
import AddressBookElementView from './AddressBookElementView';
import PageHeader from '../../components/PageHeader';

import PlusIcon from '../../../resources/svg/plus.svg';

export default function AddressBookPage() {
    return (
        <>
            <PageHeader>
                <h1>Address Book</h1>
                <PageHeader.Button align="right">
                    <PlusIcon />
                </PageHeader.Button>
            </PageHeader>
            <Grid centered columns="equal" divided>
                <Grid.Column>
                    <AddressBookList />
                </Grid.Column>
                <Grid.Column>
                    <AddressBookElementView />
                </Grid.Column>
            </Grid>
        </>
    );
}
