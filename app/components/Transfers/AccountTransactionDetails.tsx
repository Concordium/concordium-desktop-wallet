import React, { useState, useEffect } from 'react';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfScheduledTransfer,
    instanceOfUpdateAccountCredentials,
    instanceOfAddBaker,
    AddressBookEntry,
} from '../../utils/types';
import {
    lookupAddressBookEntry,
    lookupName,
} from '../../utils/transactionHelpers';
import DisplayScheduleTransfer from './DisplayScheduledTransferDetails';
import DisplayInternalTransfer from './DisplayInternalTransfer';
import DisplaySimpleTransfer from './DisplaySimpleTransfer';
import DisplayAddBaker from './DisplayAddBaker';
import DisplayAccountCredentialsUpdate from '../DisplayAccountCredentialUpdate';

interface Props {
    transaction: AccountTransaction;
}

/**
 * Component that displays the details of an AccountTransaction in a human readable way.
 * @param {AccountTransaction} transaction: The transaction, which details is displayed.
 */
export default function AccountTransactionDetails({ transaction }: Props) {
    const [fromName, setFromName] = useState<string | undefined>();
    const [to, setTo] = useState<AddressBookEntry | undefined>();

    useEffect(() => {
        lookupName(transaction.sender)
            .then((name) => setFromName(name))
            .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.

        if ('toAddress' in transaction.payload) {
            lookupAddressBookEntry(transaction.payload.toAddress)
                .then((entry) => setTo(entry))
                .catch(() => {}); // lookupAddressBookEntry will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
        }
    });

    if (instanceOfSimpleTransfer(transaction)) {
        return (
            <DisplaySimpleTransfer
                transaction={transaction}
                to={to}
                fromName={fromName}
            />
        );
    }
    if (instanceOfAddBaker(transaction)) {
        return <DisplayAddBaker transaction={transaction} />;
    }
    if (
        instanceOfTransferToEncrypted(transaction) ||
        instanceOfTransferToPublic(transaction)
    ) {
        return (
            <DisplayInternalTransfer
                transaction={transaction}
                fromName={fromName}
            />
        );
    }
    if (instanceOfScheduledTransfer(transaction)) {
        return (
            <DisplayScheduleTransfer
                transaction={transaction}
                to={to}
                fromName={fromName}
            />
        );
    }
    if (instanceOfUpdateAccountCredentials(transaction)) {
        return (
            <DisplayAccountCredentialsUpdate
                transaction={transaction}
                fromName={fromName}
            />
        );
    }
    throw new Error(`Unsupported transaction type: ${transaction}`);
}
