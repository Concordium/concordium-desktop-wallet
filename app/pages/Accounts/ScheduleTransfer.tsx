import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Button } from 'semantic-ui-react';
import { Account, AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';
import PickRecipient from '../../components/Transfers/PickRecipient';
import PickAmount from '../../components/Transfers/PickAmount';
import routes from '../../constants/routes.json';
import { toMicroUnits } from '../../utils/gtu';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 * TODO display QR code of the address?
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    const dispatch = useDispatch();

    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        undefined
    );
    const [location, setLocation] = useState<string>(locations.pickAmount);

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setLocation(locations.pickAmount);
    }

    function ChosenComponent() {
        switch (location) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        recipient={recipient}
                        amount={amount}
                        setAmount={setAmount}
                        toPickRecipient={() =>
                            setLocation(locations.pickRecipient)
                        }
                        toConfirmTransfer={() =>
                            dispatch(
                                push({
                                    pathname:
                                        routes.ACCOUNTS_SCHEDULED_TRANSFER,
                                    state: {
                                        account,
                                        amount: toMicroUnits(amount).toString(),
                                        recipient,
                                    },
                                })
                            )
                        }
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
