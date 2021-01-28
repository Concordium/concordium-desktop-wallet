import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Header } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import ConfirmTransfer from './ConfirmTransfer';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import locations from '../../constants/transferLocations.json';
import { AddressBookEntry, Account } from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';

/**
 * Controls the flow of creating a simple transfer.
 */
export default function SimpleTransfer(account: Account) {
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState(undefined);
    const [transaction, setTransaction] = useState(undefined);
    const [location, setLocation] = useState(locations.pickAmount);

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setLocation(locations.pickAmount);
    }

    function ChosenComponent() {
        switch (location) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        setLocation={setLocation}
                        recipient={recipient}
                        amount={amount}
                        setAmount={setAmount}
                    />
                );
            case locations.pickRecipient:
                return (
                    <PickRecipient
                        returnFunction={() => setLocation(locations.pickAmount)}
                        pickRecipient={chooseRecipientOnClick}
                    />
                );
            case locations.confirmTransfer:
                return (
                    <ConfirmTransfer
                        setLocation={setLocation}
                        recipient={recipient}
                        fromAddress={account.address}
                        amount={toMicroUnits(amount)}
                        setTransaction={setTransaction}
                        account={account}
                    />
                );
            case locations.transferSubmitted:
                return (
                    <FinalPage
                        transaction={transaction}
                        recipient={recipient}
                    />
                );
            default:
                return <div />;
        }
    }

    return (
        <>
            <Link to={routes.ACCOUNTS}>
                <Button>x</Button>
            </Link>
            <Header>Send Transfer</Header>
            <ChosenComponent />
        </>
    );
}
