import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect } from 'react-router';
import routes from '~/constants/routes.json';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
} from '~/utils/types';
import { UpdateInstructionHandler } from '~/utils/transactionTypes';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import getMultiSigDao from '~/database/MultiSignatureProposalDao';
import { addProposal } from '~/features/MultiSignatureSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getUpdateKey } from '~/utils/updates/AuthorizationHelper';
import { selectedProposalRoute } from '~/utils/routerHelper';
import Columns from '~/components/Columns';
import TransactionDetails from '~/components/TransactionDetails';
import ExpiredTransactionView from '../ExpiredTransactionView';
import { ensureProps } from '~/utils/componentHelpers';
import getTransactionSignDigest from '~/utils/transactionHash';
import SignTransaction from './SignTransaction';

import styles from './SignTransactionProposal.module.scss';
import MultiSignatureLayout from '../MultiSignatureLayout';
import { parse, stringify } from '~/utils/JSONHelper';

interface Props {
    proposal: MultiSignatureTransaction;
}

/**
 * Component that displays an overview of a  multi signature transaction
 * proposal that is to be signed before being generated and persisted
 * to the database.
 */
function SignTransactionProposalView({ proposal }: Props) {
    const dispatch = useDispatch();

    const { transaction } = proposal;

    const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        transaction
    );

    const transactionHandler = useMemo<
        UpdateInstructionHandler<UpdateInstruction, ConcordiumLedgerClient>
    >(() => findUpdateInstructionHandler(updateInstruction.type), [
        updateInstruction.type,
    ]);

    const transactionSignDigest = useMemo(
        () => getTransactionSignDigest(updateInstruction),
        [updateInstruction]
    );

    /** Creates the transaction, and if the ledger parameter is provided, also
     *  adds a signature on the transaction.
     */
    async function signingFunction(ledger?: ConcordiumLedgerClient) {
        const signatures = [];
        if (ledger) {
            const publicKey = await getUpdateKey(ledger, updateInstruction);

            const signatureBytes = await transactionHandler.signTransaction(
                updateInstruction,
                ledger
            );

            // Set signature
            const signature: UpdateInstructionSignature = {
                signature: signatureBytes.toString('hex'),
                authorizationPublicKey: publicKey,
            };
            signatures.push(signature);
        }
        updateInstruction.signatures = signatures;

        const updatedProposal = {
            ...proposal,
            transaction: stringify(updateInstruction),
        };

        // Save to database and use the assigned id to update the local object.
        const entryId = (await getMultiSigDao().insert(updatedProposal))[0];
        updatedProposal.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(updatedProposal));

        // Navigate to the page that displays the current proposal from the state.
        dispatch(push(selectedProposalRoute(entryId)));
    }

    if (!transactionSignDigest) {
        return null;
    }

    const transactionObject:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction = parse(transaction);

    return (
        <MultiSignatureLayout
            pageTitle={transactionHandler.title}
            stepTitle={`Transaction signing confirmation - ${transactionHandler.type}`}
            delegateScroll
        >
            <Columns
                className={styles.subtractContainerPadding}
                divider
                columnClassName={styles.column}
                columnScroll
            >
                <Columns.Column header="Transaction Details">
                    <section className={styles.detailsColumnContent}>
                        <TransactionDetails transaction={transactionObject} />
                        <ExpiredTransactionView
                            transaction={transactionObject}
                        />
                    </section>
                </Columns.Column>
                <Columns.Column
                    header="Signature and Hardware Wallet"
                    className={styles.stretchColumn}
                >
                    <SignTransaction
                        signingFunction={signingFunction}
                        onSkip={() => signingFunction()}
                    />
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}

const SignTransactionProposal = ensureProps(
    SignTransactionProposalView,
    ({ proposal }) => !!proposal,
    <Redirect to={routes.MULTISIGTRANSACTIONS} />
);

export default SignTransactionProposal;
