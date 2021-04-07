import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { parse, stringify } from 'json-bigint';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
} from '~/utils/types';
import { UpdateInstructionHandler } from '~/utils/transactionTypes';
import { createUpdateInstructionHandler } from '~/utils/updates/HandlerFinder';
import { insert } from '~/database/MultiSignatureProposalDao';
import { addProposal } from '~/features/MultiSignatureSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BlockSummary } from '~/utils/NodeApiTypes';
import findAuthorizationKey from '~/utils/updates/AuthorizationHelper';
import { selectedProposalRoute } from '~/utils/routerHelper';
import Columns from '~/components/Columns';
import TransactionDetails from '~/components/TransactionDetails';
import ExpiredEffectiveTimeView from '../ExpiredEffectiveTimeView';
import { ensureProps } from '~/utils/componentHelpers';
import getTransactionHash from '~/utils/transactionHash';
import SignTransaction from './SignTransaction';

import styles from './SignTransactionProposal.module.scss';
import MultiSignatureLayout from '../MultiSignatureLayout';

export interface SignInput {
    multiSignatureTransaction: MultiSignatureTransaction;
    blockSummary: BlockSummary;
}

interface Props {
    location: LocationDescriptorObject<string>;
}

/**
 * Component that displays an overview of a  multi signature transaction
 * proposal that is to be signed before being generated and persisted
 * to the database.
 */
function SignTransactionProposalView({ location }: Props) {
    const [showValidationError, setShowValidationError] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string>();
    const dispatch = useDispatch();

    const { multiSignatureTransaction, blockSummary }: SignInput = parse(
        location.state ?? ''
    );
    const { transaction } = multiSignatureTransaction;
    const type = 'UpdateInstruction';

    const transactionHandler = useMemo<
        UpdateInstructionHandler<UpdateInstruction, ConcordiumLedgerClient>
    >(() => createUpdateInstructionHandler({ transaction, type }), [
        transaction,
        type,
    ]);

    // TODO Add support for account transactions.
    const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        transaction
    );

    useEffect(() => {
        setTransactionHash(getTransactionHash(updateInstruction));
    }, [setTransactionHash, updateInstruction]);

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        const authorizationKey = await findAuthorizationKey(
            ledger,
            transactionHandler,
            blockSummary.updates.authorizations
        );
        if (!authorizationKey) {
            setShowValidationError(true);
            return;
        }

        const signatureBytes = await transactionHandler.signTransaction(
            updateInstruction,
            ledger
        );

        // Set signature
        const signature: UpdateInstructionSignature = {
            signature: signatureBytes.toString('hex'),
            authorizationKeyIndex: authorizationKey.index,
        };
        updateInstruction.signatures = [signature];

        const updatedMultiSigTransaction = {
            ...multiSignatureTransaction,
            transaction: stringify(updateInstruction),
        };

        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(updatedMultiSigTransaction))[0];
        updatedMultiSigTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(updatedMultiSigTransaction));

        // Navigate to the page that displays the current proposal from the state.
        dispatch(push(selectedProposalRoute(entryId)));
    }

    if (!transactionHash) {
        return null;
    }

    const transactionObject:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction = parse(transaction);

    return (
        <MultiSignatureLayout
            pageTitle={transactionHandler.title}
            stepTitle={`Transaction signing confirmation - ${transactionHandler.type}`}
        >
            <SimpleErrorModal
                show={showValidationError}
                header="Unauthorized key"
                content="Your key is not authorized to sign this update type."
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns
                className={clsx(styles.body, styles.bodySubtractPadding)}
                divider
                columnClassName={styles.column}
            >
                <Columns.Column header="Transaction Details">
                    <section className={styles.columnContent}>
                        <TransactionDetails transaction={transactionObject} />
                        <ExpiredEffectiveTimeView
                            transaction={transactionObject}
                        />
                    </section>
                </Columns.Column>
                <Columns.Column header="Signature and Hardware Wallet">
                    <SignTransaction signingFunction={signingFunction} />
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}

const SignTransactionProposal = ensureProps(
    SignTransactionProposalView,
    ({ location }) => !!location.state,
    <Redirect to={routes.MULTISIGTRANSACTIONS} />
);

export default SignTransactionProposal;
