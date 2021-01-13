import React from 'react';
import generalStyles from '../Styling.css';
import { AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';

interface Props {
    setLocation(location: string): void;
    recipient: AddressBookEntry;
    amount: string;
    setAmount(amount: string): void;
}

export default function PickAmount({
    setLocation,
    recipient,
    amount,
    setAmount,
}: Props) {
    function updateAmount(newAmount) {
        /// Checks that the input is a number and that it does not split micro units
        if (!Number.isNaN(newAmount) && Number.isInteger(newAmount * 1000000)) {
            setAmount(newAmount);
        }
    }

    return (
        <div>
            <span className={generalStyles.modalElement}>
                <input
                    name="name"
                    className={generalStyles.input}
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => updateAmount(e.target.value)}
                    data-tid="hashInput"
                    autoFocus
                />
            </span>
            <button
                type="submit"
                onClick={() => setLocation(locations.pickRecipient)}
            >
                {' '}
                {recipient ? recipient.name : 'Select Recipient'}{' '}
            </button>
            <button
                type="submit"
                onClick={() => setLocation(locations.confirmTransfer)}
                disabled={!recipient}
            >
                Continue
            </button>
        </div>
    );
}
