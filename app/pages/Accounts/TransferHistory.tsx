import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
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

interface HeaderProps {
    location: string;
    hasTransactions: boolean;
    onButtonClick(location: string): void;
}

function Header({ location, hasTransactions, onButtonClick }: HeaderProps) {
    const includeSeparator =
        location === locations.viewIdentityData || !hasTransactions;

    return (
        <div
            className={clsx(
                styles.transactionListHeader,
                includeSeparator && styles.thickBlueSeparator
            )}
        >
            <Button
                clear
                onClick={() => onButtonClick(locations.listTransactions)}
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
                onClick={() => onButtonClick(locations.viewIdentityData)}
                disabled={location === locations.viewIdentityData}
            >
                Identity Data
            </Button>
        </div>
    );
}

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

    const header = (
        <Header
            location={location}
            hasTransactions={Boolean(transactions.length)}
            onButtonClick={setLocation}
        />
    );

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
                            {header}
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
                        {header}
                        <DisplayIdentityAttributes />
                    </Card>
                );
            default:
                return null;
        }
    }

    return <ChosenComponent />;
}
