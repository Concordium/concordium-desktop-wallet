import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import DisplayIdentityAttributes from './DisplayIdentityAttributes';
import locations from '../../constants/transactionLocations.json';
import { TransferTransaction } from '../../utils/types';

/**
 * Contains view of the account's transactions,
 * detailed view of a chosen one, and
 * display of the account's revealedAttributes.
 * TODO Rename this.
 */
export default function TransferHistory() {
    const [location, setLocation] = useState(locations.listTransactions);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >(undefined);

    function Header() {
        return (
            <Button.Group>
                <Button
                    onClick={() => setLocation(locations.listTransactions)}
                    disabled={location === locations.listTransactions}
                >
                    Transfers
                </Button>
                <Button
                    onClick={() => setLocation(locations.viewIdentityData)}
                    disabled={location === locations.viewIdentityData}
                >
                    Identity Data
                </Button>
            </Button.Group>
        );
    }

    function ChosenComponent() {
        switch (location) {
            case locations.listTransactions:
                return (
                    <>
                        <Header />
                        <TransactionList
                            onTransactionClick={(transaction) => {
                                setChosenTransaction(transaction);
                                setLocation(locations.viewTransaction);
                            }}
                        />
                    </>
                );
            case locations.viewTransaction:
                if (chosenTransaction === undefined) {
                    return null;
                }
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
                    <>
                        <Header />
                        <DisplayIdentityAttributes />
                    </>
                );
            default:
                return null;
        }
    }

    return <ChosenComponent />;
}
