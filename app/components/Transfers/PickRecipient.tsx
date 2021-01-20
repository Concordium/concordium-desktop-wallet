import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Button, Header } from 'semantic-ui-react';
import {
    loadAddressBook,
    addressBookSelector,
} from '../../features/AddressBookSlice';
import { AddressBookEntry } from '../../utils/types';

interface Props {
    returnFunction(): void;
    pickRecipient(recipient: AddressBookEntry): void;
}

export default function PickRecipient({
    returnFunction,
    pickRecipient,
}: Props) {
    const addressBook = useSelector(addressBookSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);

    return (
        <>
            <Button onClick={returnFunction}>{'<--'}</Button>
            <Menu vertical fluid>
                <Header textAlign="center">Pick Recipient</Header>
                {addressBook.map((entry: AddressBookEntry) => (
                    <Menu.Item
                        key={entry.address}
                        onClick={() => pickRecipient(entry)}
                    >
                        {entry.name}
                    </Menu.Item>
                ))}
            </Menu>
        </>
    );
}
