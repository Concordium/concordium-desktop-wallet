import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addressBookSelector,
    chosenIndexSelector,
    removeFromAddressBook,
    updateAddressBookEntry,
} from '../features/AddressBookSlice';
import styles from './Accounts.css';
import Modal from './Modal';
import AddAddress from './AddAddress';

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

    const modalButton = ({ open }) => (
        <button type="button" onClick={open}>
            edit
        </button>
    );

    const modalBody = ({ close }) => {
        return (
            <>
                <button type="button" onClick={close}>
                    x
                </button>
                <AddAddress
                    close={close}
                    submit={submitAddress}
                    initialValues={chosenEntry}
                />
            </>
        );
    };

    return (
        <div className={styles.chosenAccount}>
            {chosenEntry.name} {chosenEntry.address} {chosenEntry.note}{' '}
            <button
                type="button"
                onClick={() => removeFromAddressBook(dispatch, chosenEntry)}
            >
                remove
            </button>
            <Modal Accessor={modalButton} Body={modalBody} />
        </div>
    );
}
