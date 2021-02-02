import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, List, Menu, Modal } from 'semantic-ui-react';
import {
    loadAddressBook,
    chooseIndex,
    addressBookSelector,
    addToAddressBook,
} from '../features/AddressBookSlice';
import AddAddress from './AddAddress';
import AddressBookListElement from './AddressBookListElement';

export default function AddressBookList(): JSX.Element {
    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);
    const addressBook = useSelector(addressBookSelector);

    function submitAddress(name: string, address: string, note: string) {
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
                <Modal
                    closeIcon
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                    trigger={<Button>Add entry</Button>}
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
