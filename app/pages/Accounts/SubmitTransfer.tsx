import React from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Segment, Header, Grid, Button } from 'semantic-ui-react';
import { parse } from '../../utils/JSONHelper';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { sendTransaction } from '../../utils/nodeRequests';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import { monitorTransactionStatus } from '../../utils/TransactionStatusPoller';
import {
    Account,
    LocalCredential,
    instanceOfLocalCredential,
    AccountInfo,
    AccountTransaction,
    Global,
    instanceOfTransferToPublic,
} from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { addPendingTransaction } from '../../features/TransactionSlice';
import { accountsInfoSelector } from '../../features/AccountSlice';
import { globalSelector } from '../../features/GlobalSlice';
import { getAccountPath } from '../../features/ledger/Path';
import TransactionDetails from '../../components/TransactionDetails';
import { makeTransferToPublicData } from '../../utils/rustInterface';
import PageLayout from '../../components/PageLayout';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import { getCredentialsOfAccount } from '~/database/CredentialDao';

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

async function buildEncryptedPayload(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient,
    global: Global,
    credential: LocalCredential,
    accountInfo: AccountInfo
) {
    if (instanceOfTransferToPublic(transaction)) {
        const prfKeySeed = await ledger.getPrfKey(credential.identityId);
        const data = await makeTransferToPublicData(
            transaction.payload.transferAmount,
            prfKeySeed.toString('hex'),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber
        );
        return { ...transaction, payload: data.payload };
    }
    return transaction;
}

/**
 * Receives transaction to sign, using the ledger,
 * and then submits it.
 */
export default function SubmitTransfer({ location }: Props) {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const {
        account,
        transaction: transactionJSON,
        cancelled,
        confirmed,
    } = location.state;

    let transaction: AccountTransaction = parse(transactionJSON);

    // This function builds the transaction then signs the transaction,
    // send the transaction, saves it, begins monitoring it's status
    // and then redirects to final page.
    async function ledgerSignTransfer(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const signatureIndex = 0;
        const credentialAccountIndex = 0; // TODO: do we need to support other credential indices here?

        if (!global) {
            setMessage('Missing global object.');
            return;
        }

        const credential = (
            await getCredentialsOfAccount(account.address)
        ).find((cred) => cred.credentialIndex === credentialAccountIndex);

        if (!credential || !instanceOfLocalCredential(credential)) {
            setMessage(
                'Unable to sign transfer, because we were unable to find credential'
            );
            return;
        }

        transaction = await buildEncryptedPayload(
            transaction,
            ledger,
            global,
            credential,
            accountInfoMap[account.address]
        );

        const path = getAccountPath({
            identityIndex: account.identityId,
            accountIndex: credential.credentialNumber,
            signatureIndex,
        });
        const signature: Buffer = await ledger.signTransfer(transaction, path);
        const signatureStructured = buildTransactionAccountSignature(
            credentialAccountIndex,
            signatureIndex,
            signature
        );
        const serializedTransaction = serializeTransaction(
            transaction,
            () => signatureStructured
        );
        const transactionHash = getTransactionHash(
            transaction,
            () => signatureStructured
        ).toString('hex');
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
        <PageLayout>
            <PageLayout.Header>
                <h1>Accounts | Submit Transfer</h1>
            </PageLayout.Header>
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
        </PageLayout>
    );
}
