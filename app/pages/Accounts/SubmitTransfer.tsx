import React from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Segment, Header, Grid, Button } from 'semantic-ui-react';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { sendTransaction } from '../../utils/nodeRequests';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import { monitorTransactionStatus } from '../../utils/TransactionStatusPoller';
import {
    Account,
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

interface Location {
    pathname: string;
    state: Record<string, unknown>;
}

interface State {
    transaction: AccountTransaction;
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
    account: Account,
    accountInfo: AccountInfo
) {
    if (instanceOfTransferToPublic(transaction)) {
        const prfKeySeed = await ledger.getPrfKey(account.identityId);
        const data = await makeTransferToPublicData(
            transaction.payload.transferAmount,
            prfKeySeed.toString(),
            global,
            accountInfo.accountEncryptedAmount.selfAmount,
            accountInfo.accountEncryptedAmount.startIndex,
            account.accountNumber
        );
        console.log(data.payload);
        console.log(data.hex);
        return { ...transaction, payload: data.payload };
    }
    return transaction;
}

/**
 * Receives transaction to sign, using the ledger,
 * and then submits it.
 * TODO generalize, as right now it only really works with simple transfers.
 */
export default function SubmitTransfer({ location }: Props) {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, cancelled, confirmed } = location.state;
    let { transaction } = location.state;

    // This function builds the transaction then signs the transaction,
    // send the transaction, saves it, begins monitoring it's status
    // and then redirects to final page.
    // TODO: Break this function up
    async function ledgerSignTransfer(ledger: ConcordiumLedgerClient) {
        if (!global) {
            throw new Error('whoops');
        }
        transaction = await buildEncryptedPayload(
            transaction,
            ledger,
            global,
            account,
            accountInfoMap[account.address]
        );
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
    );
}
