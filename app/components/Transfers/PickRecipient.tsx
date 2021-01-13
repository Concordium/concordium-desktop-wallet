import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
        <div>
            <button type="submit" onClick={returnFunction}>
                {'<--'}
            </button>
            {addressBook.map((entry: AddressBookEntry) => (
                <div key={entry.address} onClick={() => pickRecipient(entry)}>
                    {entry.name}
                </div>
            ))}
        </div>
    );
}
