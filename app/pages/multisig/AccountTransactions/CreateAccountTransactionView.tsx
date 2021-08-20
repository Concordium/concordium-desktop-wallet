import React from 'react';
import { Redirect, useParams } from 'react-router';
import { AccountTransactionType } from '@concordium/node-sdk/lib/src/types';
import CreateTransferProposal from './CreateTransferProposal';

import UpdateCredentialPage from './UpdateAccountCredentials/UpdateCredentialsPage';
import AddBaker from './AddBaker';
import UpdateBakerKeys from './UpdateBakerKeys';
import RemoveBaker from './RemoveBaker';
import ErrorBoundary from '~/components/ErrorBoundary';
import routes from '~/constants/routes.json';
import UpdateBakerStake from './UpdateBakerStake';
import UpdateBakerRestakeEarnings from './UpdateBakerRestakeEarnings';

function AccountTransactionRoutes(): JSX.Element {
    const { transactionKind: transactionKindRaw } = useParams<{
        transactionKind: string;
    }>();
    const transactionKind: AccountTransactionType = parseInt(
        transactionKindRaw,
        10
    );

    switch (transactionKind) {
        case AccountTransactionType.UpdateCredentials:
            return <UpdateCredentialPage />;
        case AccountTransactionType.SimpleTransfer:
        case AccountTransactionType.TransferWithSchedule:
            return <CreateTransferProposal transactionKind={transactionKind} />;
        case AccountTransactionType.AddBaker:
            return <AddBaker />;
        case AccountTransactionType.UpdateBakerKeys:
            return <UpdateBakerKeys />;
        case AccountTransactionType.RemoveBaker:
            return <RemoveBaker />;
        case AccountTransactionType.UpdateBakerStake:
            return <UpdateBakerStake />;
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return <UpdateBakerRestakeEarnings />;
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
