import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';
import {
    loadTransactions,
    viewingShieldedSelector,
} from '../../features/TransactionSlice';
import TransactionList from './TransactionList';
import TransactionView from './TransactionView';
import DisplayIdentityAttributes from './DisplayIdentityAttributes';
import locations from '../../constants/transactionLocations.json';
import { Account, TransferTransaction } from '../../utils/types';

interface Props {
    account: Account;
}

/**
 * Contains view of the account's transactions,
 * detailed view of a chosen one, and
 * display of the account's revealedAttributes.
 * TODO Rename this.
 */
export default function TransferHistory({ account }: Props) {
    const dispatch = useDispatch();
    const [location, setLocation] = useState(locations.listTransactions);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >(undefined);
    const viewingShielded = useSelector(viewingShieldedSelector);

    useEffect(() => {
        loadTransactions(account, viewingShielded, dispatch);
    }, [dispatch, account, viewingShielded]);

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
