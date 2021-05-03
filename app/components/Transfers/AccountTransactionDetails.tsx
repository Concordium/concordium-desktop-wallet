import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfScheduledTransfer,
    instanceOfUpdateAccountCredentials,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerKeys,
} from '../../utils/types';
import { lookupName } from '../../utils/transactionHelpers';
import { chosenAccountSelector } from '../../features/AccountSlice';
import DisplayScheduleTransfer from './DisplayScheduledTransferDetails';
import DisplayInternalTransfer from './DisplayInternalTransfer';
import DisplaySimpleTransfer from './DisplaySimpleTransfer';
import DisplayAddBaker from './DisplayAddBaker';
import DisplayUpdateBakerKeys from './DisplayUpdateBakerKeys';
import DisplayRemoveBaker from './DisplayRemoveBaker';
import DisplayAccountCredentialsUpdate from '../DisplayAccountCredentialUpdate';

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
            <DisplaySimpleTransfer
                transaction={transaction}
                toName={toName}
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
                toName={toName}
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
