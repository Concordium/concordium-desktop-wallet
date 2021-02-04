import React, { ComponentProps, FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, Header, Icon, Modal } from 'semantic-ui-react';
import {
    addressBookSelector,
    chosenIndexSelector,
    removeFromAddressBook,
    updateAddressBookEntry,
} from '../features/AddressBookSlice';
import { AddressBookEntry } from '../utils/types';
import AddAddress from './AddAddress/AddAddress';

export default function AddressBookElementView() {
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenIndexSelector);
    const addressBook = useSelector(addressBookSelector);
    const chosenEntry = addressBook[chosenIndex];

    if (chosenIndex >= addressBook.length) {
        return null;
    }

    function submitAddress(name, address, note) {
        const entry = {
            name,
            address,
            note,
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
                <EditEntry entry={chosenEntry} onSubmit={submitAddress} />
                <DeleteEntry
                    entry={chosenEntry}
                    onRemove={(entry) => removeFromAddressBook(dispatch, entry)}
                />
            </Button.Group>
        </Card>
    );
}

interface EditEntryProps {
    entry: AddressBookEntry;
    onSubmit: ComponentProps<typeof AddAddress>['submit'];
}

const EditEntry: FC<EditEntryProps> = ({ entry, onSubmit }) => {
    const [open, setOpen] = useState(false);

    return (
        <Modal
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button disabled={entry.readOnly}>Edit</Button>}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>Edit an entry in your address book</Modal.Header>
            <Modal.Content>
                <AddAddress
                    initialValues={entry}
                    close={() => setOpen(false)}
                    submit={onSubmit}
                />
            </Modal.Content>
        </Modal>
    );
};

interface DeleteEntryProps extends Pick<EditEntryProps, 'entry'> {
    onRemove(entry: AddressBookEntry): void;
}

const DeleteEntry: FC<DeleteEntryProps> = ({ entry, onRemove }) => {
    const [open, setOpen] = useState(false);

    function remove(): void {
        onRemove(entry);
        setOpen(false);
    }

    return (
        <Modal
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                <Button negative disabled={entry.readOnly}>
                    Delete
                </Button>
            }
            dimmer="blurring"
            closeOnDimmerClick={false}
            basic
            size="mini"
        >
            <Modal.Header>
                Are you sure you want to delete this entry? The address will be
                lost.
            </Modal.Header>
            <Modal.Actions>
                <Button
                    disabled={entry.readOnly}
                    onClick={() => setOpen(false)}
                >
                    <Icon name="remove" />
                    Cancel
                </Button>
                <Button negative disabled={entry.readOnly} onClick={remove}>
                    <Icon name="checkmark" />
                    Yes, I&apos;m sure.
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
