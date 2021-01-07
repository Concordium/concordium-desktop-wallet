import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    transactionsSelector,
    loadTransactions,
} from '../features/TransactionSlice';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import locations from '../constants/transactionLocations.json';

export default function TransferHistory(account) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const [location, setLocation] = useState(locations.listTransactions);
    const [chosenTransaction, setChosenTransaction] = useState(undefined);

    useEffect(() => {
        loadTransactions(account, dispatch);
    }, [dispatch, account]);

    function chosenComponent() {
        switch (location) {
            case locations.listTransactions:
                return (
                    <TransactionList
                        account={account}
                        transactions={transactions}
                        chooseElement={(transaction) => {
                            setChosenTransaction(transaction);
                            setLocation(locations.viewTransaction);
                        }}
                    />
                );
            case locations.viewTransaction:
                return (
                    <TransactionView
                        transaction={chosenTransaction}
                        returnFunction={() =>
                            setLocation(locations.listTransactions)
                        }
                    />
                );
            case locations.viewIdentityData:
                return <div />;
            default:
                return <div />;
        }
    }

    return <div key={location}> {chosenComponent()}</div>;
}
