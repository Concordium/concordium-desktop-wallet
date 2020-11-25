import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    loadAddressBook,
    addressBookSelector,
    chooseIndex,
    chosenIndexSelector,
} from '../features/AddressBookSlice.ts';
import styles from './Accounts.css';

export default function AddressBook(): JSX.Element {
    const dispatch = useDispatch();
    useEffect(() => {
        loadAddressBook(dispatch);
    }, []);
    const addressBook = useSelector(addressBookSelector);
    const chosenIndex = useSelector(chosenIndexSelector);
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
            {addressBook.length > chosenIndex && (
                <div className={styles.chosenAccount}>
                    {' '}
                    {addressBook[chosenIndex].name}{' '}
                    {addressBook[chosenIndex].address}{' '}
                    {addressBook[chosenIndex].note}{' '}
                </div>
            )}
        </div>
    );
}
