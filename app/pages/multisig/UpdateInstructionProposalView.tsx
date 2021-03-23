import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { parse, stringify } from 'json-bigint';
import * as ed from 'noble-ed25519';
import { useParams } from 'react-router';
import {
    proposalsSelector,
    updateCurrentProposal,
} from '~/features/MultiSignatureSlice';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
    instanceOfUpdateInstruction,
    Transaction,
} from '~/utils/types';
import {
    getBlockSummary,
    getConsensusStatus,
    sendTransaction,
} from '~/utils/nodeRequests';
import {
    serializeForSubmission,
    serializeUpdateInstructionHeaderAndPayload,
} from '~/utils/UpdateSerialization';
import { hashSha256 } from '~/utils/serializationHelpers';
import { getMultiSignatureTransactionStatus } from '~/utils/TransactionStatusPoller';
import routes from '~/constants/routes.json';
import { findUpdateInstructionHandler } from '~/utils/updates/HandlerFinder';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import ProposalView from './ProposalView';
import { ModalErrorInput } from '~/components/SimpleErrorModal';

/**
 * Returns whether or not the given signature is valid for the proposal. The signature is valid if
 * one of the authorized verification keys can verify the signature successfully on the hash
 * of the serialized transaction.
 */
async function isSignatureValid(
    proposal: UpdateInstruction<UpdateInstructionPayload>,
    signature: UpdateInstructionSignature,
    blockSummary: BlockSummary
): Promise<boolean> {
    const handler = findUpdateInstructionHandler(proposal.type);
    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            proposal,
            handler.serializePayload(proposal)
        )
    );

    const matchingKey =
        blockSummary.updates.authorizations.keys[
            signature.authorizationKeyIndex
        ];
    return ed.verify(
        signature.signature,
        transactionHash,
        matchingKey.verifyKey
    );
}

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state.
 * This handles the Update Instruction specific behaviour.
 */
export default function UpdateInstructionProposalView() {
    const dispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const proposals = useSelector(proposalsSelector);
    const currentProposal = proposals.find((p) => p.id === parseInt(id, 10));

    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    const instruction: UpdateInstruction = parse(currentProposal.transaction);
    const handler = findUpdateInstructionHandler(instruction.type);
    const serializedPayload = handler.serializePayload(instruction);

    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            instruction,
            serializedPayload
        )
    ).toString('hex');

    async function handleSignatureFile(
        transactionObject: Transaction
    ): Promise<ModalErrorInput | undefined> {
        if (!instanceOfUpdateInstruction(transactionObject)) {
            return {
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file is invalid. It should contain a signature for an account transaction or an update instruction in the exact format exported by this application.',
            };
        }

        if (!currentProposal) {
            return {
                show: true,
                header: 'Unexpected missing current proposal',
            };
        }
        const proposal: UpdateInstruction<UpdateInstructionPayload> = parse(
            currentProposal.transaction
        );

        // We currently restrict the amount of signatures imported at the same time to be 1, as it
        // simplifies error handling and currently it is only possible to export a file signed once.
        // This can be expanded to support multiple signatures at a later point in time if need be.
        if (transactionObject.signatures.length !== 1) {
            return {
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file does not contain exactly one signature. Multiple signatures or zero signatures are not valid input.',
            };
        }

        const signature = transactionObject.signatures[0];

        // Prevent the user from adding a signature that is already present on the proposal.
        if (
            proposal.signatures
                .map((sig) => sig.signature)
                .includes(signature.signature)
        ) {
            return {
                show: true,
                header: 'Duplicate signature',
                content:
                    'The loaded signature file contains a signature that is already present on the proposal.',
            };
        }

        let validSignature = false;
        try {
            const consensusStatus: ConsensusStatus = await getConsensusStatus();
            const blockSummary = await getBlockSummary(
                consensusStatus.lastFinalizedBlock
            );
            validSignature = await isSignatureValid(
                proposal,
                signature,
                blockSummary
            );
        } catch (error) {
            // Can happen if the node is not reachable.
            return {
                show: true,
                header: 'Unable to reach node',
                content:
                    'It was not possible to reach the node, which is required to validate that the loaded signature verifies against an authorization key.',
            };
        }

        // Prevent the user from adding an invalid signature.
        if (!validSignature) {
            return {
                show: true,
                header: 'Invalid signature',
                content:
                    'The loaded signature file contains a signature that is either not for this proposal, or was signed by an unauthorized key.',
            };
        }

        proposal.signatures = proposal.signatures.concat(
            transactionObject.signatures
        );
        const updatedProposal = {
            ...currentProposal,
            transaction: stringify(proposal),
        };

        updateCurrentProposal(dispatch, updatedProposal);
        return undefined;
    }

    async function submitTransaction() {
        if (!currentProposal) {
            // TODO: can we remove this without getting a type error.
            throw new Error(
                'The proposal page should not be loaded without a proposal in the state.'
            );
        }
        const payload = serializeForSubmission(instruction, serializedPayload);
        const submitted = (await sendTransaction(payload)).getValue();
        const modifiedProposal: MultiSignatureTransaction = {
            ...currentProposal,
        };
        if (submitted) {
            modifiedProposal.status = MultiSignatureTransactionStatus.Submitted;
            updateCurrentProposal(dispatch, modifiedProposal);
            getMultiSignatureTransactionStatus(modifiedProposal, dispatch);
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION,
                    state: stringify(modifiedProposal),
                })
            );
        } else {
            modifiedProposal.status = MultiSignatureTransactionStatus.Failed;
            updateCurrentProposal(dispatch, modifiedProposal);
        }
    }

    return (
        <ProposalView
            title={handler.title}
            transaction={instruction}
            transactionHash={transactionHash}
            signatures={instruction.signatures}
            handleSignatureFile={handleSignatureFile}
            submitTransaction={submitTransaction}
            currentProposal={currentProposal}
        />
    );
}
