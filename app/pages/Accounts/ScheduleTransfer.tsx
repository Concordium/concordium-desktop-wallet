import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import {
    Account,
    AddressBookEntry,
    AccountTransaction,
} from '../../utils/types';
import locations from '../../constants/transferLocations.json';
import PickRecipient from '../../components/Transfers/PickRecipient';
import PickAmount from '../../components/Transfers/PickAmount';
import FinalPage from '../../components/Transfers/FinalPage';
import routes from '../../constants/routes.json';
import { toMicroUnits, toGTUString } from '../../utils/gtu';

interface State {
    amount: string;
    transaction: AccountTransaction;
    recipient: AddressBookEntry;
    initialPage: string;
}

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
    const location = useLocation<State>();

    const [amount, setAmount] = useState<string>(
        location?.state?.amount ? toGTUString(location?.state?.amount) : ''
    ); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient || undefined
    );
    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setSubLocation(locations.pickAmount);
    }

    function ChosenComponent() {
        switch (subLocation) {
            case locations.pickAmount:
                return (
                    <PickAmount
                        recipient={recipient}
                        amount={amount}
                        setAmount={setAmount}
                        toPickRecipient={() =>
                            setSubLocation(locations.pickRecipient)
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
            case locations.transferSubmitted: {
                return <FinalPage location={location} />;
            }
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
