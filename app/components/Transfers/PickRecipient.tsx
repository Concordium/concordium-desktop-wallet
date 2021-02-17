import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Button, Header, Input, Container } from 'semantic-ui-react';
import { addressBookSelector } from '../../features/AddressBookSlice';
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
    const [filter, setFilter] = useState<string>('');

    function onSubmit(name: string, address: string, note: string) {
        pickRecipient({
            name,
            address,
            note,
        } as AddressBookEntry);
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
            <UpsertAddress as={Button} onSubmit={onSubmit}>
                Create new Entry
            </UpsertAddress>
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
