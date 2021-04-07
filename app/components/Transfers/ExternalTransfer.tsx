import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import { AddressBookEntry } from '~/utils/types';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import TransferView from './TransferView';

interface Props {
    toConfirmTransfer(amount: string, recipient: AddressBookEntry): void;
    exitFunction(): void;
    estimatedFee?: bigint;
    amountHeader: string;
}

/**
 * Controls the flow of creating an external transfer.
 */
export default function ExternalTransfer({
    toConfirmTransfer,
    amountHeader,
    estimatedFee,
    exitFunction,
}: Props) {
    const location = useLocation<TransferState>();

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    const [amount, setAmount] = useState<string>(location?.state?.amount); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient
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
                        header={amountHeader}
                        defaultAmount={amount}
                        estimatedFee={estimatedFee}
                        toPickRecipient={(currentAmount: string) => {
                            setAmount(currentAmount);
                            setSubLocation(locations.pickRecipient);
                        }}
                        toConfirmTransfer={(currentAmount: string) => {
                            if (!recipient) {
                                throw new Error('Unexpected missing recipient');
                            }
                            toConfirmTransfer(currentAmount, recipient);
                        }}
                    />
                );
            case locations.pickRecipient:
                return <PickRecipient pickRecipient={chooseRecipientOnClick} />;
            case locations.transferSubmitted: {
                return <FinalPage location={location} />;
            }
            default:
                throw new Error('Unexpected location');
        }
    }

    return (
        <TransferView
            showBack={
                subLocation === locations.pickRecipient ||
                subLocation === locations.confirmTransfer
            }
            exitOnClick={exitFunction}
            backOnClick={() => setSubLocation(locations.pickAmount)}
        >
            <ChosenComponent />
        </TransferView>
    );
}
