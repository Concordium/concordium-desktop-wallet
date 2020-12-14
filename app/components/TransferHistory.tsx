import React, { useEffect, useState } from 'react';
import { getTransactions } from '../utils/httpRequests';

export default function TransferHistory(account) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        getTransactions(account.address).then(data => {
            setTransactions(response.transactions);
        })
    }, [])

    return (
        <div>
            {transactions.map((transaction, i) =>
                { transaction }
            )}
        </div>
    );
}
