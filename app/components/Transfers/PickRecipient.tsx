import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Button, Header, Input, Container } from 'semantic-ui-react';
import {
    loadAddressBook,
    addressBookSelector,
    addToAddressBook,
} from '../../features/AddressBookSlice';
import UpsertAddress from '../UpsertAddress';
import { AddressBookEntry } from '../../utils/types';

interface Props {
    pickRecipient(recipient: AddressBookEntry): void;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 */
export default function PickRecipient({ pickRecipient }: Props) {
    const addressBook = useSelector(addressBookSelector);
    const dispatch = useDispatch();
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);

    function submitAddress(name: string, address: string, note: string) {
        const entry = {
            name,
            address,
            note,
            readOnly: false,
        };
        addToAddressBook(dispatch, entry);
        pickRecipient(entry);
    }

    return (
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
            <UpsertAddress
                trigger={<Button>Create new Entry</Button>}
                submit={submitAddress}
            />
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
    );
}
