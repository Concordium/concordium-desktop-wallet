import React from 'react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindId,
} from '~/utils/types';
import { getGTUSymbol, displayAsGTU } from '~/utils/gtu';
import styles from './MultisignatureAccountTransactions.module.scss';

interface Props {
    transactionType: TransactionKindId;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    recipient: AddressBookEntry | undefined;
}

const placeholderText = 'To be determined';

// TODO make an actual function for this;
function getTransactionCost(type: TransactionKindId) {
    if (type) {
        return 100n;
    }
    return 200n;
}

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    transactionType,
}: Props) {
    const fee = getTransactionCost(transactionType);
    return (
        <div className={styles.details}>
            <b>Identity:</b>
            <h2>{identity ? identity.name : placeholderText}</h2>
            <b>Account:</b>
            <h2>{account ? account.name : placeholderText}</h2>
            <b>Amount:</b>
            <h2>{amount ? `${getGTUSymbol()} ${amount}` : placeholderText}</h2>
            <b>Estimated Fee: {displayAsGTU(fee)}</b>
            <br />
            <br />
            <b>Recipient:</b>
            <h2>{recipient ? recipient.name : 'To be determined'}</h2>
            {recipient ? `Note: ${recipient.note}` : null}
            <br />
        </div>
    );
}
