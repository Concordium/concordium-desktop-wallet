import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { Account, AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';
import PickRecipient from '../../components/Transfers/PickRecipient';
import PickAmount from '../../components/Transfers/PickAmount';
import FinalPage from '../../components/Transfers/FinalPage';
import routes from '../../constants/routes.json';
import { toMicroUnits, toGTUString } from '../../utils/gtu';
import { TransferState } from '../../utils/transactionTypes';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Controls the flow of creating a scheduled transfer.
 * TODO: display transactionCost while building schedule + in FinalPage
 */
export default function ScheduleTransfer({ account, returnFunction }: Props) {
    const dispatch = useDispatch();
    const location = useLocation<TransferState>();

    // This is a string, to allows user input in GTU
    const [amount, setAmount] = useState<string>(
        location?.state?.amount ? toGTUString(location?.state?.amount) : ''
    );
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
                        header="Send funds with a release schedule"
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
                return <FinalPage location={location} estimatedFee={0n} />;
            }
            default:
                return null;
        }
    }

    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <ChosenComponent />
        </>
    );
}
