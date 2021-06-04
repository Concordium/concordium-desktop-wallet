import React, { useState, useEffect } from 'react';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfScheduledTransfer,
    instanceOfEncryptedTransfer,
    instanceOfUpdateAccountCredentials,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerKeys,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerRestakeEarnings,
    AddressBookEntry,
} from '../../utils/types';
import {
    lookupAddressBookEntry,
    lookupName,
} from '../../utils/transactionHelpers';
import DisplayScheduleTransfer from './DisplayScheduledTransferDetails';
import DisplayInternalTransfer from './DisplayInternalTransfer';
import DisplaySimpleTransfer from './DisplaySimpleTransfer';
import DisplayEncryptedTransfer from './DisplayEncryptedTransfer';
import DisplayAddBaker from './DisplayAddBaker';
import DisplayUpdateBakerKeys from './DisplayUpdateBakerKeys';
import DisplayRemoveBaker from './DisplayRemoveBaker';
import DisplayAccountCredentialsUpdate from '../DisplayAccountCredentialUpdate';
import DisplayUpdateBakerStake from './DisplayUpdateBakerStake';
import DisplayUpdateBakerRestakeEarnings from './DisplayUpdateBakerRestakeEarnings';

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
    if (instanceOfEncryptedTransfer(transaction)) {
        return (
            <DisplayEncryptedTransfer
                transaction={transaction}
                to={to}
                fromName={fromName}
            />
        );
    }
    if (instanceOfAddBaker(transaction)) {
        return <DisplayAddBaker transaction={transaction} />;
    }
    if (instanceOfUpdateBakerKeys(transaction)) {
        return <DisplayUpdateBakerKeys transaction={transaction} />;
    }
    if (instanceOfUpdateBakerStake(transaction)) {
        return <DisplayUpdateBakerStake transaction={transaction} />;
    }
    if (instanceOfUpdateBakerRestakeEarnings(transaction)) {
        return <DisplayUpdateBakerRestakeEarnings transaction={transaction} />;
    }
    if (instanceOfRemoveBaker(transaction)) {
        return <DisplayRemoveBaker transaction={transaction} />;
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
