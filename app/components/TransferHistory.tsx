import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { getTransactions, getGlobal } from '../utils/httpRequests';
import {
    addressBookSelector,
    loadAddressBook,
} from '../features/AddressBookSlice';
import TransactionListElement from './TransactionListElement';
import { decryptAmounts } from '../utils/rustInterface';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';

async function decryptTransactions(transactions, account) {
    const global = (await getGlobal()).value;
    const indices = [];
    const encryptedAmounts = [];

    transactions.forEach((t, i) => {
        if (t.details.type === 'encryptedAmountTransfer') {
            encryptedAmounts.push(t.encrypted.encryptedAmount);
            indices.push(i);
        }
    });

    if (indices.length > 0) {
        const transport = await TransportNodeHid.open('');
        const ledger = new ConcordiumLedgerClient(transport);

        const decryptedAmounts = await decryptAmounts(
            encryptedAmounts,
            account,
            global,
            ledger
        );

        indices.forEach((oldIndex, amountIndex) => {
            transactions[oldIndex].details.transferAmount =
                decryptedAmounts[amountIndex];
        });
    }

    return transactions;
}

export default function TransferHistory(account) {
    const dispatch = useDispatch();
    const addressBook = useSelector(addressBookSelector);

    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        getTransactions(account.address)
            .then((data) => {
                setTransactions(data.transactions);
                return decryptTransactions(data.transactions, account);
            })
            .then((decryptedTransactions) =>
                setTransactions(decryptedTransactions)
            )
            .catch((err) => setError(err));
        loadAddressBook(dispatch);
    }, [dispatch, account, transactions]);

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
