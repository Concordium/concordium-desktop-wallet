import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, Header } from 'semantic-ui-react';
import {
    addressBookSelector,
    chosenIndexSelector,
    removeFromAddressBook,
    updateAddressBookEntry,
} from '../../features/AddressBookSlice';
import DeleteAddress from './DeleteAddress';
import UpsertAddress from '../../components/UpsertAddress';

export default function AddressBookElementView() {
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenIndexSelector);
    const addressBook = useSelector(addressBookSelector);
    const chosenEntry = addressBook[chosenIndex];

    if (chosenIndex >= addressBook.length) {
        return null;
    }

    function submitAddress(name: string, address: string, note: string) {
        const entry = {
            name,
            address,
            note,
            readOnly: false,
        };
        updateAddressBookEntry(dispatch, chosenEntry.name, entry);
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header textAlign="center">{chosenEntry.name}</Card.Header>
                <Card.Description textAlign="center">
                    <Header size="small">Account address</Header>
                    {chosenEntry.address}
                </Card.Description>
                <Card.Description textAlign="center">
                    <Header size="small">Notes</Header>
                    {chosenEntry.note}
                </Card.Description>
            </Card.Content>
            <Button.Group>
                <UpsertAddress
                    trigger={
                        <Button disabled={chosenEntry.readOnly}>Edit</Button>
                    }
                    initialValues={chosenEntry}
                    submit={submitAddress}
                />
                <DeleteAddress
                    entry={chosenEntry}
                    onRemove={(entry) => removeFromAddressBook(dispatch, entry)}
                />
            </Button.Group>
        </Card>
    );
}
