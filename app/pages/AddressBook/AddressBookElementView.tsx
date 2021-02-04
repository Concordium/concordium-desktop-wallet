import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, Header, Modal } from 'semantic-ui-react';
import {
    addressBookSelector,
    chosenIndexSelector,
    removeFromAddressBook,
    updateAddressBookEntry,
} from '../../features/AddressBookSlice';
import AddressBookEntryForm from '../../components/AddressBookEntryForm';

export default function AddressBookElementView() {
    const [open, setOpen] = useState(false);

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
                <Modal
                    closeIcon
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                    trigger={
                        <Button disabled={chosenEntry.readOnly}>Edit</Button>
                    }
                    dimmer="blurring"
                    closeOnDimmerClick={false}
                >
                    <Modal.Header>
                        Edit an entry in your address book
                    </Modal.Header>
                    <Modal.Content>
                        <AddressBookEntryForm
                            initialValues={chosenEntry}
                            close={() => setOpen(false)}
                            submit={submitAddress}
                        />
                    </Modal.Content>
                </Modal>
                <Button
                    negative
                    disabled={chosenEntry.readOnly}
                    onClick={() => removeFromAddressBook(dispatch, chosenEntry)}
                >
                    Delete
                </Button>
            </Button.Group>
        </Card>
    );
}
