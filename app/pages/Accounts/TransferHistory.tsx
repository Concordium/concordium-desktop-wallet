import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import DisplayIdentityAttributes from './DisplayIdentityAttributes';
import locations from '~/constants/transactionLocations.json';
import { Account, TransferTransaction } from '~/utils/types';
import DecryptComponent from './DecryptComponent';
import styles from './Transactions.module.scss';
import {
    transactionsSelector,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';

interface Props {
    account: Account;
}

/**
 * Contains view of the account's transactions,
 * detailed view of a chosen one, and
 * display of the account's revealedAttributes.
 */
export default function TransferHistory({ account }: Props) {
    const transactions = useSelector(transactionsSelector);
    const [location, setLocation] = useState(locations.listTransactions);
    const viewingShielded = useSelector(viewingShieldedSelector);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >(undefined);

    useEffect(() => {
        if (chosenTransaction) {
            const upToDateChosenTransaction = transactions.find(
                (transaction) =>
                    transaction.transactionHash ===
                    chosenTransaction.transactionHash
            );
            if (upToDateChosenTransaction) {
                setChosenTransaction(upToDateChosenTransaction);
            }
        }
    }, [transactions, chosenTransaction, setChosenTransaction]);

    useEffect(() => {
        setChosenTransaction(undefined);
    }, [account.address]);

    function Header() {
        return (
            <div
                className={
                    location === locations.viewIdentityData
                        ? styles.identityDataHeader
                        : styles.transactionListHeader
                }
            >
                <Button
                    clear
                    onClick={() => setLocation(locations.listTransactions)}
                    className={
                        location === locations.listTransactions
                            ? styles.transactionListHeaderChosen
                            : styles.transactionListHeaderNotChosen
                    }
                    disabled={location === locations.listTransactions}
                >
                    Transfers
                </Button>
                <Button
                    clear
                    className={
                        location === locations.viewIdentityData
                            ? styles.transactionListHeaderChosen
                            : styles.transactionListHeaderNotChosen
                    }
                    onClick={() => setLocation(locations.viewIdentityData)}
                    disabled={location === locations.viewIdentityData}
                >
                    Identity Data
                </Button>
            </div>
        );
    }

    function ChosenComponent() {
        switch (location) {
            case locations.listTransactions:
                if (chosenTransaction) {
                    return (
                        <TransactionView
                            transaction={chosenTransaction}
                            returnFunction={() =>
                                setChosenTransaction(undefined)
                            }
                        />
                    );
                }
                if (!viewingShielded || account.allDecrypted) {
                    return (
                        <Card className="pB0">
                            <Header />
                            <TransactionList
                                transactions={transactions}
                                onTransactionClick={(transaction) => {
                                    setChosenTransaction(transaction);
                                }}
                            />
                        </Card>
                    );
                }
                return <DecryptComponent account={account} />;
            case locations.viewIdentityData:
                return (
                    <Card className="pB0">
                        <Header />
                        <DisplayIdentityAttributes />
                    </Card>
                );
            default:
                return null;
        }
    }

    return <ChosenComponent />;
}
