import React from 'react';
import { Grid } from 'semantic-ui-react';
import AddressBookList from './AddressBookList';
import AddressBookElementView from './AddressBookElementView';

import PlusIcon from '../../../resources/svg/plus.svg';
import UpsertAddress from '../../components/UpsertAddress';
import PageLayout from '../../components/PageLayout';

export default function AddressBookPage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Address Book</h1>
                <UpsertAddress as={PageLayout.HeaderButton} align="right">
                    <PlusIcon />
                </UpsertAddress>
            </PageLayout.Header>
            <Grid centered columns="equal" divided>
                <Grid.Column>
                    <AddressBookList />
                </Grid.Column>
                <Grid.Column>
                    <AddressBookElementView />
                </Grid.Column>
            </Grid>
        </PageLayout>
    );
}
