import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfScheduledTransfer,
} from '../../utils/types';
import { lookupName } from '../../utils/transactionHelpers';
import { chosenAccountSelector } from '../../features/AccountSlice';
import DisplayScheduleTransfer from './DisplayScheduledTransferDetails';
import SimpleTransferDetails from './DisplaySimpleTransfer';
import DisplayInternalTransfer from './DisplayInternalTransfer';

interface Props {
    transaction: AccountTransaction;
}

/**
 * Component that displays the details of an AccountTransaction in a human readable way.
 * @param {AccountTransaction} transaction: The transaction, which details is displayed.
 */
export default function AccountTransactionDetails({ transaction }: Props) {
    const account = useSelector(chosenAccountSelector);
    const fromName = account?.name;
    const [toName, setToName] = useState<string | undefined>();

    useEffect(() => {
        if ('toAddress' in transaction.payload) {
            lookupName(transaction.payload.toAddress)
                .then((name) => setToName(name))
                .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
        }
    });

    if (instanceOfSimpleTransfer(transaction)) {
        return (
            <SimpleTransferDetails
                transaction={transaction}
                toName={toName}
                fromName={fromName}
            />
        );
    }
    if (instanceOfTransferToEncrypted(transaction)) {
        return (
            <DisplayInternalTransfer
                transaction={transaction}
                fromName={fromName}
            />
        );
    }
    if (instanceOfTransferToPublic(transaction)) {
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
                toName={toName}
                fromName={fromName}
            />
        );
    }
    throw new Error(`Unsupported transaction type: ${transaction}`);
}
