import React from 'react';
import { LocationDescriptorObject } from 'history';
import { Redirect } from 'react-router';
import { TransactionKindId } from '~/utils/types';
import CreateTransferProposal from './CreateTransferProposal';
import UpdateCredentialPage from './UpdateCredentialsPage';
import ErrorBoundary from '~/components/ErrorBoundary';
import routes from '~/constants/routes.json';

interface Props {
    location: LocationDescriptorObject<TransactionKindId>;
}

function MultiSignatureRoutes({ location }: Props): JSX.Element {
    const type = location.state;
    if (type === TransactionKindId.Update_credentials) {
        return <UpdateCredentialPage />;
    }
    if (
        type === TransactionKindId.Simple_transfer ||
        type === TransactionKindId.Transfer_with_schedule
    ) {
        return <CreateTransferProposal transactionKind={type} />;
    }
    throw new Error(`unsupported transaction type: ${type}`);
}

export default function CreateAccountTransactionView(
    props: Props
): JSX.Element {
    return (
        <ErrorBoundary fallback={<Redirect to={routes.MULTISIGTRANSACTIONS} />}>
            <MultiSignatureRoutes {...props} />
        </ErrorBoundary>
    );
}
