import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { Account, AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';
import PickRecipient from '../../components/Transfers/PickRecipient';
import PickAmount from '../../components/Transfers/PickAmount';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 * TODO display QR code of the address?
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        undefined
    );
    const [location, setLocation] = useState<string>(locations.pickAmount);

    console.log(account);

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
                return <PickRecipient pickRecipient={chooseRecipientOnClick} />;
            default:
                return <div />;
        }
    }

    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <ChosenComponent />
        </>
    );
}
