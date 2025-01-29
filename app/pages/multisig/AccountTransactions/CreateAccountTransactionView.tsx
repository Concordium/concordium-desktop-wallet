import React from 'react';
import { Redirect, useParams } from 'react-router';
import { TransactionKindId } from '~/utils/types';
import CreateTransferProposal from './CreateTransferProposal';

import RegisterData from './RegisterData';
import UpdateCredentialPage from './UpdateAccountCredentials/UpdateCredentialsPage';
import ErrorBoundary from '~/components/ErrorBoundary';
import routes from '~/constants/routes.json';

function AccountTransactionRoutes(): JSX.Element {
    const { transactionKind: transactionKindRaw } = useParams<{
        transactionKind: string;
    }>();
    const transactionKind: TransactionKindId = parseInt(transactionKindRaw, 10);

    switch (transactionKind) {
        case TransactionKindId.Update_credentials:
            return <UpdateCredentialPage />;
        case TransactionKindId.Simple_transfer:
        case TransactionKindId.Transfer_with_schedule:
            return <CreateTransferProposal transactionKind={transactionKind} />;
        case TransactionKindId.Register_data:
            return <RegisterData />;
        default:
            throw new Error(`unsupported transaction type: ${transactionKind}`);
    }
}

export default function CreateAccountTransactionView(): JSX.Element {
    return (
        <ErrorBoundary fallback={<Redirect to={routes.MULTISIGTRANSACTIONS} />}>
            <AccountTransactionRoutes />
        </ErrorBoundary>
    );
}
