import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Menu,
    Button,
    Header,
    Input,
    Container,
    Modal,
} from 'semantic-ui-react';
import {
    loadAddressBook,
    addressBookSelector,
    addToAddressBook,
} from '../../features/AddressBookSlice';
import AddAddress from '../AddAddress';
import { AddressBookEntry } from '../../utils/types';

interface Props {
    returnFunction(): void;
    pickRecipient(recipient: AddressBookEntry): void;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 */
export default function PickRecipient({
    returnFunction,
    pickRecipient,
}: Props) {
    const addressBook = useSelector(addressBookSelector);
    const dispatch = useDispatch();
    const [filter, setFilter] = useState<string>('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);

    function submitAddress(name, address, note) {
        const entry = {
            name,
            address,
            note,
        };
        addToAddressBook(dispatch, entry);
    }

    return (
        <>
            <Button onClick={returnFunction}>{'<--'}</Button>
            <Container>
                <Header textAlign="center">Pick Recipient</Header>
                <Input
                    fluid
                    name="name"
                    placeholder="Filter name"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    autoFocus
                />
                <Modal
                    closeIcon
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                    trigger={<Button>Create new Entry</Button>}
                    dimmer="blurring"
                    closeOnDimmerClick={false}
                >
                    <Modal.Header>
                        Add an entry to your address book
                    </Modal.Header>
                    <Modal.Content>
                        <AddAddress
                            close={() => setOpen(false)}
                            submit={submitAddress}
                        />
                    </Modal.Content>
                </Modal>
                <Menu vertical fluid>
                    {addressBook
                        .filter((entry: AddressBookEntry) =>
                            entry.name.includes(filter)
                        )
                        .map((entry: AddressBookEntry) => (
                            <Menu.Item
                                key={entry.address}
                                tabIndex="0"
                                onKeyPress={() => pickRecipient(entry)}
                                onClick={() => pickRecipient(entry)}
                            >
                                {entry.name}
                            </Menu.Item>
                        ))}
                </Menu>
            </Container>
        </>
    );
}
