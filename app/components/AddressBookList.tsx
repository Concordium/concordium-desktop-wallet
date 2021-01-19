import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    loadAddressBook,
    chooseIndex,
    addressBookSelector,
    chosenIndexSelector,
    addToAddressBook,
} from '../features/AddressBookSlice';
import styles from './Accounts.css';
import Modal from './Modal';
import AddAddress from './AddAddress';
import AddressBookListElement from './AddressBookListElement';

export default function AddressBookList(): JSX.Element {
    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, [dispatch]);
    const addressBook = useSelector(addressBookSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    function submitAddress(name, address, note) {
        const entry = {
            name,
            address,
            note,
        };
        addToAddressBook(dispatch, entry);
    }

    const modalButton = ({ open }) => (
        <button type="button" onClick={open}>
            +
        </button>
    );

    const modalBody = ({ close }) => {
        return (
            <>
                <button type="button" onClick={close}>
                    x
                </button>
                <AddAddress close={close} submit={submitAddress} />
            </>
        );
    };

    return (
        <div className={styles.halfPage}>
            <Modal Accessor={modalButton} Body={modalBody} />
            {addressBook.map((entry, i) => (
                <AddressBookListElement
                    key={entry.address}
                    entry={entry}
                    isChosen={i === chosenIndex}
                    onClick={() => dispatch(chooseIndex(i))}
                />
            ))}
        </div>
    );
}
