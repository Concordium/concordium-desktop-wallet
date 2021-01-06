import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTransactions } from '../utils/httpRequests';
import {
    addressBookSelector,
    loadAddressBook,
} from '../features/AddressBookSlice';
import TransactionListElement from './TransactionListElement';

export default function TransferHistory(account) {
    const dispatch = useDispatch();
    const addressBook = useSelector(addressBookSelector);

    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        getTransactions(account.address)
            .then((data) => {
                console.log(data);
                return setTransactions(data.transactions);
            })
            .catch((err) => setError(err));
        loadAddressBook(dispatch);
    }, [dispatch, account.address]);

    if (error) {
        return <div>Loading transactions failed due to: {error}</div>;
    }

    return (
        <div>
            {transactions.map((transaction) => (
                <TransactionListElement
                    transaction={transaction}
                    addressBook={addressBook}
                    key={transaction.transactionHash}
                />
            ))}
        </div>
    );
}
