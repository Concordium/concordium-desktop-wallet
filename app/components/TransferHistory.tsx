import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addressBookSelector,
    loadAddressBook,
} from '../features/AddressBookSlice';
import {
    transactionsSelector,
    loadTransactions,
    updateTransactions,
} from '../features/TransactionSlice';
import TransactionListElement from './TransactionListElement';
import { fromMicroUnits } from '../utils/transactionHelpers';

function determineBalance(transactions) {
    const microBalance = transactions.reduce(
        (balance, transaction) => balance + parseInt(transaction.total, 10),
        0
    );
    return fromMicroUnits(microBalance);
}

export default function TransferHistory(account) {
    const dispatch = useDispatch();
    const addressBook = useSelector(addressBookSelector);
    const transactions = useSelector(transactionsSelector);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        loadTransactions(account, dispatch);
        loadAddressBook(dispatch);
    }, [dispatch, account]);

    useEffect(() => {
        setBalance(determineBalance(transactions));
    }, [transactions]);

    return (
        <div>
            <button
                type="button"
                onClick={() =>
                    updateTransactions(account, transactions).then(() =>
                        loadTransactions(account, dispatch)
                    )
                }
            >
                Update
            </button>
            Balance: {balance}
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
