import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import { TransactionKindId, AddressBookEntry, Fraction } from '~/utils/types';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import TransferView from './TransferView';

interface Props {
    toConfirmTransfer(amount: string, recipient: AddressBookEntry): void;
    exitFunction(): void;
    estimatedFee?: Fraction;
    amountHeader: string;
    senderAddress: string;
    transactionKind: TransactionKindId;
}

/**
 * Controls the flow of creating an external transfer.
 */
export default function ExternalTransfer({
    toConfirmTransfer,
    amountHeader,
    estimatedFee,
    exitFunction,
    senderAddress,
    transactionKind,
}: Props) {
    const location = useLocation<TransferState>();

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    const [amount, setAmount] = useState<string>(location?.state?.amount ?? ''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        location?.state?.recipient
    );

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        setSubLocation(locations.pickAmount);
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
            {subLocation === locations.pickAmount && (
                <PickAmount
                    recipient={recipient}
                    header={amountHeader}
                    defaultAmount={amount}
                    estimatedFee={estimatedFee}
                    transactionKind={transactionKind}
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
            )}
            {subLocation === locations.pickRecipient && (
                <div className="mH30">
                    <PickRecipient
                        pickRecipient={chooseRecipientOnClick}
                        senderAddress={senderAddress}
                    />
                </div>
            )}
            {subLocation === locations.transferSubmitted && (
                <FinalPage location={location} />
            )}
        </TransferView>
    );
}
