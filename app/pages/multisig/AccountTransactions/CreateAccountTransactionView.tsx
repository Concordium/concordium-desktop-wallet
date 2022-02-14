import React from 'react';
import { Redirect, useParams } from 'react-router';
import { TransactionKindId } from '~/utils/types';
import CreateTransferProposal from './CreateTransferProposal';

import UpdateCredentialPage from './UpdateAccountCredentials/UpdateCredentialsPage';
import AddBaker from './OldBakerFlows/AddBaker';
import UpdateBakerKeys from './OldBakerFlows/UpdateBakerKeys';
import RemoveBaker from './OldBakerFlows/RemoveBaker';
import UpdateBakerStake from './OldBakerFlows/UpdateBakerStake';
import UpdateBakerRestakeEarnings from './OldBakerFlows/UpdateBakerRestakeEarnings';
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
        case TransactionKindId.Add_baker:
            return <AddBaker />;
        case TransactionKindId.Update_baker_keys:
            return <UpdateBakerKeys />;
        case TransactionKindId.Remove_baker:
            return <RemoveBaker />;
        case TransactionKindId.Update_baker_stake:
            return <UpdateBakerStake />;
        case TransactionKindId.Update_baker_restake_earnings:
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
