import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadTransactions } from '../features/TransactionSlice';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import locations from '../constants/transactionLocations.json';

// TODO Rename this
export default function TransferHistory(account, viewingShielded) {
    const dispatch = useDispatch();
    const [location, setLocation] = useState(locations.listTransactions);
    const [chosenTransaction, setChosenTransaction] = useState(undefined);

    useEffect(() => {
        loadTransactions(account, viewingShielded, dispatch);
    }, [dispatch, account, viewingShielded]);

    function chosenComponent() {
        switch (location) {
            case locations.listTransactions:
                return (
                    <TransactionList
                        account={account}
                        viewingShielded={viewingShielded}
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
