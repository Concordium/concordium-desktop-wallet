import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadTransactions,
    viewingShieldedSelector,
    updateTransactions,
    transactionsSelector,
} from '../features/TransactionSlice';
import { getHighestId } from '../utils/transactionHelpers';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import DisplayIdentityAttributes from './DisplayIdentityAttributes';
import locations from '../constants/transactionLocations.json';
import styles from './Transaction.css';

// TODO Rename this
export default function TransferHistory(account) {
    const dispatch = useDispatch();
    const [location, setLocation] = useState(locations.listTransactions);
    const [chosenTransaction, setChosenTransaction] = useState(undefined);
    const transactions = useSelector(transactionsSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    useEffect(() => {
        loadTransactions(account, viewingShielded, dispatch);
    }, [dispatch, account, viewingShielded]);

    function Header() {
        return (
            <div className={styles.TransactionListHeader}>
                <button
                    type="button"
                    onClick={() =>
                        updateTransactions(
                            account,
                            getHighestId(transactions)
                        ).then(() =>
                            loadTransactions(account, viewingShielded, dispatch)
                        )
                    }
                >
                    Update
                </button>
                <button
                    type="button"
                    onClick={() => setLocation(locations.listTransactions)}
                >
                    Transfers
                </button>
                <button
                    type="button"
                    onClick={() => setLocation(locations.viewIdentityData)}
                >
                    Identity Data
                </button>
            </div>
        );
    }

    function chosenComponent() {
        switch (location) {
            case locations.listTransactions:
                return (
                    <div className={styles.transactionBox}>
                        <Header />
                        <TransactionList
                            viewingShielded={viewingShielded}
                            chooseElement={(transaction) => {
                                setChosenTransaction(transaction);
                                setLocation(locations.viewTransaction);
                            }}
                        />
                    </div>
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
                return (
                    <div className={styles.transactionBox}>
                        <Header />
                        <DisplayIdentityAttributes />
                    </div>
                );
            default:
                return <div />;
        }
    }

    return <div key={location}> {chosenComponent()}</div>;
}
