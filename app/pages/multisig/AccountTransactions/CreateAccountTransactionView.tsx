import React from 'react';
import { Redirect, useParams } from 'react-router';
import { TransactionKindId } from '~/utils/types';
import CreateTransferProposal from './CreateTransferProposal';

import UpdateCredentialPage from './UpdateCredentialsPage';
import ErrorBoundary from '~/components/ErrorBoundary';
import routes from '~/constants/routes.json';

function AccountTransactionRoutes(): JSX.Element {
    const { transactionKind: transactionKindRaw } = useParams<{
        transactionKind: string;
    }>();
    const transactionKind: TransactionKindId = parseInt(transactionKindRaw, 10);

    if (transactionKind === TransactionKindId.Update_credentials) {
        return <UpdateCredentialPage />;
    }
    if (
        [
            TransactionKindId.Simple_transfer,
            TransactionKindId.Transfer_with_schedule,
        ].includes(transactionKind)
    ) {
        return <CreateTransferProposal transactionKind={transactionKind} />;
    }
    throw new Error(`unsupported transaction type: ${transactionKind}`);
}

export default function CreateAccountTransactionView(): JSX.Element {
    return (
        <ErrorBoundary fallback={<Redirect to={routes.MULTISIGTRANSACTIONS} />}>
            <AccountTransactionRoutes />
        </ErrorBoundary>
    );
}
