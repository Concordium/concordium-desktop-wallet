import React from 'react';
import { useParams } from 'react-router';
import { TransactionKindString } from '~/utils/types';
import SimpleTransfer from './SimpleTransfer';
import UpdateCredentialPage from './UpdateCredentialsPage';
import AddBaker from './AddBaker';
import UpdateBakerKeys from './UpdateBakerKeys';
import RemoveBaker from './RemoveBaker';

export default function CreateAccountTransactionView(): JSX.Element {
    const { transactionKind } = useParams<{
        transactionKind: TransactionKindString;
    }>();

    // eslint-disable-next-line default-case
    switch (transactionKind) {
        case TransactionKindString.UpdateCredentials:
            return <UpdateCredentialPage />;
        case TransactionKindString.Transfer:
            return <SimpleTransfer />;
        case TransactionKindString.AddBaker:
            return <AddBaker />;
        case TransactionKindString.UpdateBakerKeys:
            return <UpdateBakerKeys />;
        case TransactionKindString.RemoveBaker:
            return <RemoveBaker />;
        default:
            throw new Error(`unsupported transaction type: ${transactionKind}`);
    }
}
