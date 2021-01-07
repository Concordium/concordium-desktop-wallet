import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { fromMicroUnits, getHighestId } from '../utils/transactionHelpers';
import {
    transactionsSelector,
    updateTransactions,
    loadTransactions,
} from '../features/TransactionSlice';

function determineBalance(transactions) {
    const microBalance = transactions.reduce(
        (balance, transaction) => balance + parseInt(transaction.total, 10),
        0
    );
    return fromMicroUnits(microBalance);
}

interface Props {
    account: Account;
    chooseElement: () => void;
}

function TransactionList({ account, chooseElement }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        setBalance(determineBalance(transactions));
    }, [transactions]);

    return (
        <div>
            <button
                type="button"
                onClick={() =>
                    updateTransactions(
                        account,
                        getHighestId(transactions)
                    ).then(() => loadTransactions(account, dispatch))
                }
            >
                Update
            </button>
            Balance: {balance}
            {transactions.map((transaction) => (
                <TransactionListElement
                    transaction={transaction}
                    key={transaction.transactionHash}
                    onClick={() => chooseElement(transaction)}
                />
            ))}
        </div>
    );
}

export default TransactionList;
