import React from 'react';
import { LocationDescriptorObject } from 'history';
import { TransactionKindId } from '~/utils/types';
import Transfers from './Transfers';
import UpdateCredentialPage from './UpdateCredentialsPage';

interface Props {
    location: LocationDescriptorObject<TransactionKindId>;
}

export default function MultiSignatureRoutes({ location }: Props): JSX.Element {
    const type = location.state;
    if (type === TransactionKindId.Update_credentials) {
        return <UpdateCredentialPage />;
    }
    if (
        type === TransactionKindId.Simple_transfer ||
        type === TransactionKindId.Transfer_with_schedule
    ) {
        return <Transfers transactionKind={type} />;
    }
    throw new Error(`unsupported transaction type: ${type}`);
}
