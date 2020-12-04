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

    function submitAddress(name, address, note) {
        const payload = {
            index: chosenIndex,
            entry: {
                name,
                address,
                note,
            },
        };
        dispatch(updateAddressBookEntry(payload));
    }

    const modalButton = (open) => <button onClick={open}>edit</button>;

    const modalBody = (close) => {
        return (
            <>
                <button onClick={close}>x</button>
                {new AddAddress(close, submitAddress, chosenEntry)}
            </>
        );
    };

    const modal = Modal(modalButton, modalBody);

    if (chosenIndex >= addressBook.length) {
        return <div />;
    }

    return (
        <div className={styles.chosenAccount}>
            {chosenEntry.name} {chosenEntry.address} {chosenEntry.note}{' '}
            <button
                onClick={() => dispatch(removeFromAddressBook(chosenIndex))}
            >
                remove
            </button>
            {modal}
        </div>
    );
}
