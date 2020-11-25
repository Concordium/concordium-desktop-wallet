import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    loadAddressBook,
    addressBookSelector,
    chooseIndex,
    chosenIndexSelector,
} from '../features/AddressBookSlice.ts';
import styles from './Accounts.css';
import Modal from './Modal';
import AddAddress from './AddAddress';

export default function AddressBook(): JSX.Element {
    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, []);
    const addressBook = useSelector(addressBookSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    const modalButton = (open) => (<button onClick={open}>Click</button>);
    const modalBody = (close) =>
        {
            return (
                <>
                <button onClick={close}>x</button>
                {AddAddress(close)}
                </>
            )
        };

    return (
        <div>
            {addressBook.map((entry, i) => (
                <div
                    key={entry.address}
                    onClick={() => dispatch(chooseIndex(i))}
                    className={
                    i == chosenIndex ? styles.chosen : styles.nonChosen
                    }
                >
                    {entry.name}
                </div>
            ))}
            <div className={styles.blob}></div>
            {addressBook.length > chosenIndex && (
                <div className={styles.chosenAccount}>
                    {' '}
                    {addressBook[chosenIndex].name}{' '}
                    {addressBook[chosenIndex].address}{' '}
                    {addressBook[chosenIndex].note}{' '}
                </div>
            )}
            <div className={styles.blob}></div>
            {Modal(modalButton, modalBody)}
        </div>
    );
}
