import React from 'react';
import { Account, Identity, TransactionKindString } from '~/utils/types';

interface Props {
    transactionType: TransactionKindString;
    account: Account | undefined;
    identity: Identity | undefined;
}

export default function TPD({ identity, account, transactionType }: Props) {
    return (
        <>
            <h2>{transactionType}</h2>
            <h2>Identity:</h2>
            <b>{identity ? identity.name : 'Choose an ID on the right'}</b>
            <h2>Account:</h2>
            <b>{account ? account.name : 'Choose an account on the right'}</b>
        </>
    );
}
