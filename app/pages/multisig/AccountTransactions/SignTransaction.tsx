import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Account,
    AccountTransaction,
    Credential,
    MultiSignatureTransactionStatus,
    MultiSignatureTransaction,
} from '~/utils/types';
import { stringify } from '~/utils/JSONHelper';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import { globalSelector } from '~/features/GlobalSlice';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { insert } from '~/database/MultiSignatureProposalDao';
import { addProposal } from '~/features/MultiSignatureSlice';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import Form from '~/components/Form';
import styles from '~/pages/multisig/SignTransactionProposal/SignTransactionProposal.module.scss';

interface Props {
    setReady: (ready: boolean) => void;
    transaction: AccountTransaction;
    account: Account | undefined;
    primaryCredential: Credential;
    setProposalId: (id: number) => void;
}

/**
 * Prompts the user to sign the transaction.
 */
export default function SignTransaction({
    setReady,
    transaction,
    account,
    primaryCredential,
    setProposalId,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const signatureIndex = 0;

        if (!account || !global) {
            throw new Error('unexpected missing global/account');
        }
        if (
            primaryCredential.identityNumber === undefined ||
            primaryCredential.credentialNumber === undefined ||
            primaryCredential.credentialIndex === undefined
        ) {
            throw new Error(
                'Unable to sign transaction, because given credential was not local and deployed.'
            );
        }
        const path = {
            identityIndex: primaryCredential.identityNumber,
            accountIndex: primaryCredential.credentialNumber,
            signatureIndex,
        };

        const handler = findAccountTransactionHandler(
            transaction.transactionKind
        );
        const signature = await handler.signTransaction(
            transaction,
            ledger,
            path
        );

        const multiSignatureTransaction: Partial<MultiSignatureTransaction> = {
            // The JSON serialization of the transaction
            transaction: stringify({
                ...transaction,
                signatures: buildTransactionAccountSignature(
                    primaryCredential.credentialIndex,
                    signatureIndex,
                    signature
                ),
            }),
            // The minimum required signatures for the transaction
            // to be accepted on chain.
            threshold: account.signatureThreshold,
            // The current state of the proposal
            status: MultiSignatureTransactionStatus.Open,
        };

        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(multiSignatureTransaction))[0];
        multiSignatureTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(multiSignatureTransaction));

        setMessage('Update generated succesfully!');
        setReady(true);
        setProposalId(entryId);
    }
    const [signing, setSigning] = useState(false);

    return (
        <Ledger ledgerCallback={sign} onSignError={() => setSigning(false)}>
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <section className={styles.signColumnContent}>
                    <h5>Hardware wallet status</h5>
                    {statusView}
                    <Form
                        onSubmit={() => {
                            setSigning(true);
                            submitHandler();
                        }}
                    >
                        <Form.Checkbox
                            name="check"
                            rules={{
                                required:
                                    'Make sure the proposed changes are correct',
                            }}
                            disabled={signing}
                        >
                            I am sure that the propsed changes are correct
                        </Form.Checkbox>
                        <Form.Submit
                            disabled={signing || !isReady}
                            className={styles.submit}
                        >
                            Generate Transaction
                        </Form.Submit>
                    </Form>
                </section>
            )}
        </Ledger>
    );
}
