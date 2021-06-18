import React, { useState } from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import type { Buffer } from 'buffer/';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import { parse } from '~/utils/JSONHelper';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { sendTransaction } from '~/node/nodeRequests';
import {
    serializeTransaction,
    getAccountTransactionHash,
} from '~/utils/transactionSerialization';
import { monitorTransactionStatus } from '~/utils/TransactionStatusPoller';
import {
    Account,
    AccountInfo,
    AccountTransaction,
    CredentialWithIdentityNumber,
    Global,
    instanceOfTransferToPublic,
    instanceOfTransferToEncrypted,
    instanceOfEncryptedTransfer,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addPendingTransaction } from '~/features/TransactionSlice';
import { accountsInfoSelector } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { getAccountPath } from '~/features/ledger/Path';
import TransactionDetails from '~/components/TransactionDetails';
import {
    makeTransferToEncryptedData,
    makeTransferToPublicData,
    makeEncryptedTransferData,
} from '~/utils/rustInterface';
import PageLayout from '~/components/PageLayout';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import errorMessages from '~/constants/errorMessages.json';
import routes from '~/constants/routes.json';

import styles from './SubmitTransfer.module.scss';
import Card from '~/cross-app-components/Card';
import PrintButton from '~/components/PrintButton';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';

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
    credential: CredentialWithIdentityNumber,
    accountInfo: AccountInfo
) {
    if (instanceOfTransferToEncrypted(transaction)) {
        const prfKeySeed = await ledger.getPrfKey(credential.identityNumber);
        const data = await makeTransferToEncryptedData(
            transaction.payload.amount,
            prfKeySeed.toString('hex'),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber
        );

        const payload = {
            ...transaction.payload,
            newSelfEncryptedAmount: data.newSelfEncryptedAmount,
            remainingDecryptedAmount: data.decryptedRemaining,
        };

        return { ...transaction, payload };
    }
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
            remainingDecryptedAmount: data.decryptedRemaining,
        };

        return { ...transaction, payload };
    }
    if (instanceOfEncryptedTransfer(transaction)) {
        const prfKeySeed = await ledger.getPrfKey(credential.identityNumber);
        const receiverAccountInfo = await getAccountInfoOfAddress(
            transaction.payload.toAddress
        );
        const data = await makeEncryptedTransferData(
            transaction.payload.plainTransferAmount,
            receiverAccountInfo.accountEncryptionKey,
            prfKeySeed.toString('hex'),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber
        );

        const payload = {
            ...transaction.payload,
            proof: data.payload.proof,
            index: data.payload.index,
            transferAmount: data.payload.transferAmount,
            remainingEncryptedAmount: data.payload.remainingAmount,
            remainingDecryptedAmount: data.decryptedRemaining,
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
    const [rejected, setRejected] = useState(false);

    if (!location.state) {
        return <Redirect to={routes.ACCOUNTS} />;
    }

    const {
        account,
        transaction: transactionJSON,
        cancelled,
        confirmed,
    } = location.state;

    let transaction: AccountTransaction = parse(transactionJSON);
    const handler = findHandler(transaction);

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
            setMessage(errorMessages.missingGlobal);
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
            signatureStructured
        );

        const transactionHashBuffer = await getAccountTransactionHash(
            transaction,
            signatureStructured
        );
        const transactionHash = transactionHashBuffer.toString('hex');
        const response = await sendTransaction(serializedTransaction);

        if (response.getValue()) {
            const convertedTransaction = await addPendingTransaction(
                transaction,
                transactionHash
            );
            monitorTransactionStatus(dispatch, convertedTransaction);

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
            setRejected(true);
        }
    }

    const printOutput = handler.print(
        transaction,
        MultiSignatureTransactionStatus.Open
    );

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Accounts | Submit Transfer</h1>
            </PageLayout.Header>
            <PageLayout.Container
                closeRoute={cancelled}
                backRoute={cancelled}
                padding="vertical"
            >
                <SimpleErrorModal
                    show={rejected}
                    header="Transfer rejected"
                    content="Your transfer was rejected by the node."
                    onClick={() => setRejected(false)}
                />
                <div className={styles.grid}>
                    <h2 className={styles.header}>
                        Submit the transaction with your hardware wallet
                    </h2>
                    <p>
                        Choose your hardware wallet on the right. Be sure to
                        verify that{' '}
                        <b>all the information below is exactly the same</b> on
                        your hardware wallet, before submitting the transaction.
                    </p>
                    <Card
                        header={
                            <span className={styles.summaryHeader}>
                                Transaction details
                                {Boolean(printOutput) && (
                                    <PrintButton className={styles.print}>
                                        {printOutput}
                                    </PrintButton>
                                )}
                            </span>
                        }
                        className={styles.summary}
                    >
                        <div className="mT40">
                            <TransactionDetails transaction={transaction} />
                        </div>
                    </Card>
                    <SimpleLedger
                        className={styles.ledger}
                        ledgerCall={ledgerSignTransfer}
                    />
                </div>
            </PageLayout.Container>
        </PageLayout>
    );
}
