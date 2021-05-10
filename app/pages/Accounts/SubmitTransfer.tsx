import React from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Segment, Header, Grid, Button } from 'semantic-ui-react';
import { parse } from '~/utils/JSONHelper';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { sendTransaction } from '~/utils/nodeRequests';
import {
    serializeTransaction,
    getAccountTransactionHash,
} from '~/utils/transactionSerialization';
import { monitorTransactionStatus } from '~/utils/TransactionStatusPoller';
import {
    Account,
    LocalCredential,
    AccountInfo,
    AccountTransaction,
    Global,
    instanceOfTransferToPublic,
} from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addPendingTransaction } from '~/features/TransactionSlice';
import { accountsInfoSelector } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { getAccountPath } from '~/features/ledger/Path';
import TransactionDetails from '~/components/TransactionDetails';
import { makeTransferToPublicData } from '~/utils/rustInterface';
import PageLayout from '~/components/PageLayout';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';

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

async function attachCompletedPayload(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient,
    global: Global,
    credential: LocalCredential,
    accountInfo: AccountInfo
) {
    if (instanceOfTransferToPublic(transaction)) {
        const prfKeySeed = await ledger.getPrfKey(credential.identityNumber);
        const data = await makeTransferToPublicData(
            transaction.payload.transferAmount,
            prfKeySeed.toString('hex'),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber
        );
        const payload = {
            ...transaction.payload,
            proof: data.payload.proof,
            index: data.payload.index,
            remainingEncryptedAmount: data.payload.remainingAmount,
        };

        return { ...transaction, payload };
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

    /**
     * Builds the transaction, signs it, sends it to the node, saves it and
     * then beings monitoring its status before redirecting the user to the
     * final page.
     */
    async function ledgerSignTransfer(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const signatureIndex = 0;

        if (!global) {
            setMessage('Missing global object.');
            return;
        }

        const credential = await findLocalDeployedCredentialWithWallet(
            account.address,
            ledger
        );
        if (!credential) {
            throw new Error(
                'Unable to sign transfer as we were unable to find a deployed credential for the connected wallet'
            );
        }

        transaction = await attachCompletedPayload(
            transaction,
            ledger,
            global,
            credential,
            accountInfoMap[account.address]
        );

        const path = getAccountPath({
            identityIndex: credential.identityNumber,
            accountIndex: credential.credentialNumber,
            signatureIndex,
        });
        const signature: Buffer = await ledger.signTransfer(transaction, path);
        const signatureStructured = buildTransactionAccountSignature(
            credential.credentialIndex,
            signatureIndex,
            signature
        );
        const serializedTransaction = serializeTransaction(
            transaction,
            () => signatureStructured
        );
        const transactionHash = getAccountTransactionHash(
            transaction,
            () => signatureStructured
        ).toString('hex');
        const response = await sendTransaction(serializedTransaction);
        if (response.getValue()) {
            addPendingTransaction(transaction, transactionHash);
            monitorTransactionStatus(transactionHash);

            const confirmedStateWithHash = {
                transactionHash,
                ...confirmed.state,
            };
            const confirmedWithHash = {
                ...confirmed,
                state: confirmedStateWithHash,
            };
            dispatch(push(confirmedWithHash));
        } else {
            // TODO: Handle rejection from node
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
                            <SimpleLedger ledgerCall={ledgerSignTransfer} />
                        </Grid.Column>
                    </Grid>
                </Segment>
            </Container>
        </PageLayout>
    );
}
