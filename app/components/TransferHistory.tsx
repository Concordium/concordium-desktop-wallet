import React, { useEffect, useState } from 'react';
import { getTransactions } from '../utils/httpRequests';
import TransactionListElement from './TransactionListElement';

export default function TransferHistory(account) {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        getTransactions(account.address)
            .then((data) => {
                return setTransactions(data.transactions);
            })
            .catch((err) => setError(err));
    }, [account.address]);

    if (error) {
        return <div>Loading transactions failed due to: {error}</div>;
    }

    return (
        <div>
            {transactions.map((transaction) => (
                <TransactionListElement
                    transaction={transaction}
                    key={transaction.transactionHash}
                />
            ))}
        </div>
    );
}
