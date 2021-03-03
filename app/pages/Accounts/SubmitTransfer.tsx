import React from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Container, Segment, Header, Grid, Button } from 'semantic-ui-react';
import { parse } from '../../utils/JSONHelper';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { sendTransaction } from '../../utils/nodeRequests';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import { monitorTransactionStatus } from '../../utils/TransactionStatusPoller';
import { Account, AccountTransaction } from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { addPendingTransaction } from '../../features/TransactionSlice';
import { getAccountPath } from '../../features/ledger/Path';
import TransactionDetails from '../../components/TransactionDetails';
import PageHeader from '../../components/PageHeader';

interface Location {
    pathname: string;
    state: Record<string, unknown>;
}

interface State {
    transaction: string;
    account: Account;
    cancelled: Location;
    confirmed: Location;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Receives transaction to sign, using the ledger,
 * and then submits it.
 * TODO generalize, as right now it only really works with simple transfers.
 */
export default function SubmitTransfer({ location }: Props) {
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const {
        account,
        transaction: transactionJSON,
        cancelled,
        confirmed,
    } = location.state;

    const transaction: AccountTransaction = parse(transactionJSON);

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
            monitorTransactionStatus(transactionHash);

            dispatch(push(confirmed));
        } else {
            // TODO: handle rejection from node
        }
    }

    return (
        <>
            <PageHeader>
                <h1>Accounts | Submit Transfer</h1>
            </PageHeader>
            <Container>
                <Segment>
                    <Button onClick={() => dispatch(push(cancelled))}>
                        {'<--'}
                    </Button>
                    <Header textAlign="center">
                        Submit the transaction with your hardware wallet
                    </Header>
                    <Container text>
                        <p>
                            Choose your hardware wallet on the right. Be sure to
                            verify that all the information below is exactly the
                            same on your hardware wallet, before submitting the
                            transaction.
                        </p>
                    </Container>
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
        </>
    );
}
