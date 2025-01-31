import React, { useState } from 'react';
import { LocationDescriptorObject } from 'history';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import type { Buffer } from 'buffer/';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import { parse } from '~/utils/JSONHelper';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { sendAccountTransaction } from '~/node/nodeRequests';
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
    instanceOfEncryptedTransferWithMemo,
    MultiSignatureTransactionStatus,
    IdentityVersion,
} from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addPendingTransaction } from '~/features/TransactionSlice';
import { specificIdentitySelector } from '~/features/IdentitySlice';
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
import Card from '~/cross-app-components/Card';
import PrintButton from '~/components/PrintButton';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import { insert } from '~/database/DecryptedAmountsDao';
import { getKeyExportType } from '~/utils/identityHelpers';
import { FinalPageLocationState } from '~/components/Transfers/FinalPage';

import styles from './SubmitTransaction.module.scss';
import { TransactionHash } from '@concordium/web-sdk';

export interface SubmitTransactionLocationState<
    ConfirmedState = FinalPageLocationState
> {
    transaction: string;
    account: Account;
    confirmed: LocationDescriptorObject<ConfirmedState>;
}

interface Props {
    location: LocationDescriptorObject<SubmitTransactionLocationState>;
}

async function attachCompletedPayload(
    transaction: AccountTransaction,
    ledger: ConcordiumLedgerClient,
    global: Global,
    credential: CredentialWithIdentityNumber,
    accountInfo: AccountInfo,
    identityVersion: IdentityVersion,
    setMessage: (message: string) => void
) {
    const getPrfKey = async () => {
        setMessage('Please accept decrypt on device');
        const prfKeySeed = await ledger.getPrfKeyDecrypt(
            credential.identityNumber,
            getKeyExportType(identityVersion)
        );
        setMessage('Please wait');
        return prfKeySeed.toString('hex');
    };

    if (instanceOfTransferToEncrypted(transaction)) {
        const data = await makeTransferToEncryptedData(
            transaction.payload.amount,
            await getPrfKey(),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber,
            identityVersion
        );

        const payload = {
            ...transaction.payload,
            newSelfEncryptedAmount: data.newSelfEncryptedAmount,
            remainingDecryptedAmount: data.decryptedRemaining,
        };

        return { ...transaction, payload };
    }
    if (instanceOfTransferToPublic(transaction)) {
        const data = await makeTransferToPublicData(
            transaction.payload.transferAmount,
            await getPrfKey(),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber,
            identityVersion
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
    if (
        instanceOfEncryptedTransfer(transaction) ||
        instanceOfEncryptedTransferWithMemo(transaction)
    ) {
        const receiverAccountInfo = await getAccountInfoOfAddress(
            transaction.payload.toAddress
        );
        const data = await makeEncryptedTransferData(
            transaction.payload.plainTransferAmount,
            receiverAccountInfo.accountEncryptionKey,
            await getPrfKey(),
            global,
            accountInfo.accountEncryptedAmount,
            credential.credentialNumber,
            identityVersion
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
export default function SubmitTransaction({ location }: Props) {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const [rejected, setRejected] = useState(false);

    if (!location.state) {
        return <Redirect to={routes.ACCOUNTS} />;
    }

    const { account, transaction: transactionJSON, confirmed } = location.state;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const identity = useSelector(specificIdentitySelector(account.identityId));

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
            throw new Error(errorMessages.missingGlobal);
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

        if (identity === undefined) {
            throw new Error(
                'The identity was not found. This is an internal error that should be reported'
            );
        }

        transaction = await attachCompletedPayload(
            transaction,
            ledger,
            global,
            credential,
            accountInfoMap[account.address],
            identity.version,
            setMessage
        );

        const path = getAccountPath({
            identityIndex: credential.identityNumber,
            accountIndex: credential.credentialNumber,
            signatureIndex,
        });

        setMessage('Please review and sign transaction on device');
        const signature: Buffer = await ledger.signTransfer(transaction, path);
        const signatureStructured = buildTransactionAccountSignature(
            credential.credentialIndex,
            signatureIndex,
            signature
        );

        let transactionHash: string;
        try {
            transactionHash = TransactionHash.toHexString(
                await sendAccountTransaction(transaction, signatureStructured)
            );
        } catch (e) {
            window.log.error(
                e as Error,
                `Sending transaction of type ${transaction.transactionKind}, failed`
            );
            throw e;
        }

        if (transactionHash) {
            try {
                // Save the decrypted amount for shielded transfers, so the user doesn't have to decrypt them later.
                if (
                    instanceOfEncryptedTransfer(transaction) ||
                    instanceOfEncryptedTransferWithMemo(transaction)
                ) {
                    await insert({
                        transactionHash,
                        amount: transaction.payload.plainTransferAmount,
                    });
                }

                // If an error happens here, it only means the transaction couldn't be added as pending, so no reason to show user an error.
                const convertedTransaction = await addPendingTransaction(
                    transaction,
                    transactionHash
                );

                monitorTransactionStatus(dispatch, convertedTransaction);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            } finally {
                const confirmedStateWithHash = {
                    transactionHash,
                    ...confirmed.state,
                };
                const confirmedWithHash = {
                    ...confirmed,
                    state: confirmedStateWithHash,
                };
                dispatch(push(confirmedWithHash));
            }
        } else {
            window.log.warn('Sent transaction was rejected by the node');
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
                <h1>
                    <span className="pageTitlePrefix">Submit transaction</span>
                    {handler.type}
                </h1>
            </PageLayout.Header>
            <PageLayout.Container
                closeRoute={routes.ACCOUNTS}
                padding="vertical"
            >
                <SimpleErrorModal
                    show={rejected}
                    header="Transaction rejected"
                    content="Your transaction was rejected by the node."
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
                        <div className={styles.summaryContent}>
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
