import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { parse, stringify } from 'json-bigint';
import { hashSha256 } from '../../utils/serializationHelpers';
import routes from '../../constants/routes.json';
import {
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
} from '../../utils/types';
import { UpdateInstructionHandler } from '../../utils/transactionTypes';
import { createUpdateInstructionHandler } from '../../utils/updates/HandlerFinder';
import { insert } from '../../database/MultiSignatureProposalDao';
import { addProposal } from '../../features/MultiSignatureSlice';
import GenericSignTransactionProposalView from './GenericSignTransactionProposalView';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';
import SimpleErrorModal from '../../components/SimpleErrorModal';
import { BlockSummary } from '../../utils/NodeApiTypes';
import findAuthorizationKey from '../../utils/updates/AuthorizationHelper';
import { selectedProposalRoute } from '../../utils/routerHelper';

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
export default function SignTransactionProposalView({ location }: Props) {
    const [showValidationError, setShowValidationError] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string>();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const { multiSignatureTransaction, blockSummary }: SignInput = parse(
        location.state
    );
    const { transaction } = multiSignatureTransaction;
    const type = 'UpdateInstruction';

    const [transactionHandler] = useState<
        UpdateInstructionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        >
    >(() => createUpdateInstructionHandler({ transaction, type }));

    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        transaction
    );

    useEffect(() => {
        const serialized = serializeUpdateInstructionHeaderAndPayload(
            updateInstruction,
            transactionHandler.serializePayload(updateInstruction)
        );
        const hashed = hashSha256(serialized).toString('hex');
        setTransactionHash(hashed);
    }, [setTransactionHash, transactionHandler, updateInstruction]);

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
        dispatch(push(selectedProposalRoute(updatedMultiSigTransaction)));
    }

    if (!transactionHash) {
        return null;
    }

    return (
        <>
            <SimpleErrorModal
                show={showValidationError}
                header="Unauthorized key"
                content="Your key is not authorized to sign this update type."
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <GenericSignTransactionProposalView
                header={transactionHandler.title}
                transaction={transaction}
                transactionHash={transactionHash}
                signFunction={signingFunction}
                checkboxes={['The transaction details are correct']}
                signText="Sign"
            />
        </>
    );
}
