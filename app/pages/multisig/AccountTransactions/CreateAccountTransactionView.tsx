import React from 'react';
import { LocationDescriptorObject } from 'history';
import { TransactionKindString } from '~/utils/types';
import SimpleTransfer from './SimpleTransfer';
import UpdateCredentialPage from './UpdateCredentialsPage';

interface Props {
    location: LocationDescriptorObject<TransactionKindString>;
}

export default function CreateAccountTransactionView({
    location,
}: Props): JSX.Element {
    const type = location.state;
    if (type === TransactionKindString.UpdateCredentials) {
        return <UpdateCredentialPage />;
    }
    if (type === TransactionKindString.Transfer) {
        return <SimpleTransfer />;
    }
    throw new Error(`unsupported transaction type: ${type}`);
}
