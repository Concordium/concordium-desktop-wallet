import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, List, Menu } from 'semantic-ui-react';
import {
    loadAddressBook,
    chooseIndex,
    addressBookSelector,
    addToAddressBook,
} from '../features/AddressBookSlice';
import AddressBookListElement from './AddressBookListElement';
import UpsertAddress from './UpsertAddress';

export default function AddressBookList(): JSX.Element {
    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);
    const addressBook = useSelector(addressBookSelector);

    function submitAddress(name, address, note) {
        const entry = {
            name,
            address,
            note,
        };
        addToAddressBook(dispatch, entry);
    }

    return (
        <List>
            <List.Item>
                <UpsertAddress
                    trigger={<Button>Add entry</Button>}
                    submit={submitAddress}
                />
            </List.Item>
            <List.Item>
                <Menu vertical size="massive" fluid>
                    {addressBook.map((entry, i) => (
                        <AddressBookListElement
                            key={entry.address}
                            entry={entry}
                            onClick={() => dispatch(chooseIndex(i))}
                        />
                    ))}
                </Menu>
            </List.Item>
        </List>
    );
}
