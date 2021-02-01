import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Button, Header, Input, Container } from 'semantic-ui-react';
import {
    loadAddressBook,
    addressBookSelector,
} from '../../features/AddressBookSlice';
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

    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);

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
