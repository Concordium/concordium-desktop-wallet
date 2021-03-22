import React from 'react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindString,
} from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';

interface Props {
    transactionType: TransactionKindString;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    recipient: AddressBookEntry | undefined;
}

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    transactionType,
}: Props) {
    return (
        <>
            <h2>{transactionType}</h2>
            <h2>Identity:</h2>
            <b>{identity ? identity.name : 'Choose an ID on the right'}</b>
            <h2>Account:</h2>
            <b>{account ? account.name : 'Choose an account on the right'}</b>
            <h2>Amount:</h2>
            <b>{amount ? `${getGTUSymbol()} ${amount}` : 'To be determined'}</b>
            <h2>Fee:</h2>
            <b>big dollar</b>
            <h2>Recipient:</h2>
            <b>{recipient ? recipient.name : 'To be determined'}</b>
            <br />
            {recipient ? recipient.note : null}
            <br />
        </>
    );
}
