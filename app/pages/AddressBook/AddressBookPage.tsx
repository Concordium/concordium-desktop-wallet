import React from 'react';
import { Grid } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import AddressBookList from './AddressBookList';
import AddressBookElementView from './AddressBookElementView';
import PageHeader from '../../components/PageHeader';

import PlusIcon from '../../../resources/svg/plus.svg';
import UpsertAddress from '../../components/UpsertAddress';
import { addToAddressBook } from '../../features/AddressBookSlice';

export default function AddressBookPage() {
    const dispatch = useDispatch();

    function submitAddress(name: string, address: string, note: string) {
        const entry = {
            name,
            address,
            note,
            readOnly: false,
        };
        addToAddressBook(dispatch, entry);
    }
    return (
        <>
            <PageHeader>
                <h1>Address Book</h1>
                <UpsertAddress
                    as={PageHeader.Button}
                    align="right"
                    submit={submitAddress}
                >
                    <PlusIcon />
                </UpsertAddress>
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
