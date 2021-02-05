import React from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Container, Segment, Header, Grid } from 'semantic-ui-react';
import routes from '../constants/routes.json';
import LedgerComponent from '../components/ledger/LedgerComponent';
import { sendTransaction } from '../utils/client';
import {
    serializeTransaction,
    getTransactionHash,
} from '../utils/transactionSerialization';
import { waitForFinalization } from '../utils/transactionHelpers';
import { Account, AccountTransaction } from '../utils/types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import {
    addPendingTransaction,
    confirmTransaction,
    rejectTransaction,
} from '../features/TransactionSlice';
import { getAccountPath } from '../features/ledger/Path';
import TransactionDetails from '../components/TransactionDetails';

interface State {
    transaction: AccountTransaction;
    account: Account;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Wait for the transaction to be finalized (or rejected) and update accordingly
 */
async function monitorTransaction(transactionHash: string) {
    const dataObject = await waitForFinalization(transactionHash);
    if (dataObject) {
        confirmTransaction(transactionHash, dataObject);
    } else {
        rejectTransaction(transactionHash);
    }
}

export default function SubmitTransfer({ location }: Props) {
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, transaction } = location.state;

    // This function builds the transaction then signs the transaction,
    // send the transaction, saves it, begins monitoring it's status
    // and then redirects to final page.
    // TODO: Break this function up
    async function ledgerSignTransfer(ledger: ConcordiumLedgerClient) {
        const path = getAccountPath({
            identityIndex: account.identityId,
            accountIndex: account.accountNumber,
            signatureIndex: 0,
        });
        const signature: Buffer = await ledger.signTransfer(transaction, path);
        const serializedTransaction = serializeTransaction(transaction, () => [
            signature,
        ]);
        const transactionHash = getTransactionHash(transaction, () => [
            signature,
        ]).toString('hex');
        const response = await sendTransaction(serializedTransaction);
        if (response.getValue()) {
            addPendingTransaction(transaction, transactionHash);
            monitorTransaction(transactionHash);

            dispatch(
                push({
                    pathname: routes.ACCOUNTS_SIMPLETRANSFER_TRANSFERSUBMITTED,
                    state: transaction,
                })
            );
        } else {
            // TODO: handle rejection from node
        }
    }

    return (
        <Container>
            <Segment>
                <Header textAlign="center">
                    Submit the transaction with your hardware wallet
                </Header>
                <Grid columns={2} divided textAlign="center" padded>
                    <Grid.Column>
                        <TransactionDetails transaction={transaction} />
                    </Grid.Column>
                    <Grid.Column>
                        <LedgerComponent ledgerCall={ledgerSignTransfer} />
                    </Grid.Column>
                </Grid>
            </Segment>
        </Container>
    );
}
