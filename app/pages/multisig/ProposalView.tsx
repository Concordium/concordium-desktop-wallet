import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Checkbox,
    Divider,
    Form,
    Grid,
    Header,
    Segment,
} from 'semantic-ui-react';
import { push } from 'connected-react-router';
import { parse, stringify } from 'json-bigint';
import * as ed from 'noble-ed25519';
import {
    currentProposalSelector,
    updateCurrentProposal,
} from '../../features/MultiSignatureSlice';
import TransactionDetails from '../../components/TransactionDetails';
import TransactionHashView from '../../components/TransactionHashView';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../../utils/types';
import { saveFile } from '../../utils/FileHelper';
import DragAndDropFile from '../../components/DragAndDropFile';
import {
    getBlockSummary,
    getConsensusStatus,
    sendTransaction,
} from '../../utils/nodeRequests';
import {
    serializeForSubmission,
    serializeUpdateInstructionHeaderAndPayload,
} from '../../utils/UpdateSerialization';
import { hashSha256 } from '../../utils/serializationHelpers';
import { getMultiSignatureTransactionStatus } from '../../utils/TransactionStatusPoller';
import SimpleErrorModal, {
    ModalErrorInput,
} from '../../components/SimpleErrorModal';
import routes from '../../constants/routes.json';
import findHandler from '../../utils/updates/HandlerFinder';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';

/**
 * Returns whether or not the given signature is valid for the proposal. The signature is valid if
 * one of the authorized verification keys can verify the signature successfully on the hash
 * of the serialized transaction.
 */
async function isSignatureValid(
    proposal: UpdateInstruction<UpdateInstructionPayload>,
    signature: string,
    blockSummary: BlockSummary
): Promise<boolean> {
    const handler = findHandler(proposal.type);
    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            proposal,
            handler.serializePayload(proposal)
        )
    );

    const authorizedKeyIndices = handler.getAuthorization(
        blockSummary.updates.authorizations
    ).authorizedKeys;
    const authorizationKeys = blockSummary.updates.authorizations.keys.filter(
        (_key, index) => {
            return authorizedKeyIndices.includes(index);
        }
    );

    for (let i = 0; i < authorizationKeys.length; i += 1) {
        const key = authorizationKeys[i];
        // eslint-disable-next-line no-await-in-loop
        const validKey = await ed.verify(
            signature,
            transactionHash,
            key.verifyKey
        );
        if (validKey) {
            return true;
        }
    }
    return false;
}

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state. The component allows the user to export the proposal,
 * add signatures to the proposal, and if the signature threshold has been reached,
 * then the proposal can be submitted to a node.
 */
export default function ProposalView() {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [currentlyLoadingFile, setCurrentlyLoadingFile] = useState(false);
    const dispatch = useDispatch();
    const currentProposal = useSelector(currentProposalSelector);
    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    async function loadSignatureFile(file: Buffer) {
        setCurrentlyLoadingFile(true);
        let transactionObject;
        try {
            transactionObject = parse(file.toString('utf-8'));
        } catch (error) {
            setShowError({
                show: true,
                header: 'Invalid file',
                content:
                    'The chosen file was invalid. A file containing a signed multi signature transaction proposal in JSON format was expected.',
            });
            setCurrentlyLoadingFile(false);
            return;
        }

        if (instanceOfUpdateInstruction(transactionObject)) {
            if (currentProposal) {
                const proposal: UpdateInstruction<UpdateInstructionPayload> = parse(
                    currentProposal.transaction
                );

                // We currently restrict the amount of signatures imported at the same time to be 1, as it
                // simplifies error handling and currently it is only possible to export a file signed once.
                // This can be expanded to support multiple signatures at a later point in time if need be.
                if (transactionObject.signatures.length !== 1) {
                    setShowError({
                        show: true,
                        header: 'Invalid signature file',
                        content:
                            'The loaded signature file does not contain exactly one signature. Multiple signatures or zero signatures are not valid input.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                const signature = transactionObject.signatures[0];

                // Prevent the user from adding a signature that is already present on the proposal.
                if (proposal.signatures.includes(signature)) {
                    setShowError({
                        show: true,
                        header: 'Duplicate signature',
                        content:
                            'The loaded signature file contains a signature that is already present on the proposal.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                let validSignature = false;
                try {
                    const consensusStatus: ConsensusStatus = await getConsensusStatus();
                    const blockSummary = await getBlockSummary(
                        consensusStatus.lastFinalizedBlock
                    );
                    validSignature = await isSignatureValid(
                        proposal,
                        signature.signature,
                        blockSummary
                    );
                } catch (error) {
                    // Can happen if the node is not reachable.
                    setShowError({
                        show: true,
                        header: 'Unable to reach node',
                        content:
                            'It was not possible to reach the node, which is required to validate that the loaded signature verifies against an authorization key.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                // Prevent the user from adding an invalid signature.
                if (!validSignature) {
                    setShowError({
                        show: true,
                        header: 'Invalid signature',
                        content:
                            'The loaded signature file contains a signature that is either not for this proposal, or was signed by an unauthorized key.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                proposal.signatures = proposal.signatures.concat(
                    transactionObject.signatures
                );
                const updatedProposal = {
                    ...currentProposal,
                    transaction: stringify(proposal),
                };

                updateCurrentProposal(dispatch, updatedProposal);
                setCurrentlyLoadingFile(false);
            }
        } else {
            setShowError({
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file is invalid. It should contain a signature for an account transaction or an update instruction in the exact format exported by this application.',
            });
            setCurrentlyLoadingFile(false);
        }
    }

    const instruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        currentProposal.transaction
    );
    const handler = findHandler(instruction.type);
    const serializedPayload = handler.serializePayload(instruction);

    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            instruction,
            serializedPayload
        )
    ).toString('hex');

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

    const unsignedCheckboxes = [];
    for (
        let i = 0;
        i < currentProposal.threshold - instruction.signatures.length;
        i += 1
    ) {
        unsignedCheckboxes.push(
            <Form.Field key={i}>
                <Checkbox label="Awaiting signature" readOnly />
            </Form.Field>
        );
    }

    const missingSignatures =
        instruction.signatures.length !== currentProposal.threshold;

    return (
        <Segment secondary textAlign="center">
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <Header size="large">Your transaction proposal</Header>
            <Segment basic>
                Your transaction proposal has been generated. An overview can be
                seen below.
            </Segment>
            <Segment>
                <Header>Transaction Proposal | Transaction Type</Header>
                <Divider />
                <Grid columns={3} divided textAlign="center" padded>
                    <Grid.Column>
                        <TransactionDetails transaction={instruction} />
                    </Grid.Column>
                    <Grid.Column>
                        <Grid.Row>
                            <Form>
                                {instruction.signatures.map((signature) => {
                                    return (
                                        <Form.Field key={signature.signature}>
                                            <Checkbox
                                                label={`Signed (${signature.signature.substring(
                                                    0,
                                                    16
                                                )}...)`}
                                                defaultChecked
                                                readOnly
                                            />
                                        </Form.Field>
                                    );
                                })}
                                {unsignedCheckboxes}
                            </Form>
                        </Grid.Row>
                        <Divider />
                        <Grid.Row>
                            <DragAndDropFile
                                text="Drag and drop signatures here"
                                fileProcessor={loadSignatureFile}
                                disabled={
                                    !missingSignatures || currentlyLoadingFile
                                }
                            />
                        </Grid.Row>
                    </Grid.Column>
                    <Grid.Column>
                        <TransactionHashView
                            transactionHash={transactionHash}
                        />
                    </Grid.Column>
                </Grid>
            </Segment>
            <Grid columns="equal">
                <Grid.Column>
                    <Button
                        fluid
                        primary
                        disabled={
                            currentProposal.status !==
                            MultiSignatureTransactionStatus.Open
                        }
                        onClick={
                            () =>
                                saveFile(
                                    currentProposal.transaction,
                                    'Export transaction'
                                )
                            // TODO Handle failure
                        }
                    >
                        Export transaction proposal
                    </Button>
                </Grid.Column>
                <Grid.Column>
                    <Button
                        fluid
                        positive
                        disabled={
                            missingSignatures ||
                            currentProposal.status !==
                                MultiSignatureTransactionStatus.Open
                        }
                        onClick={submitTransaction}
                    >
                        Submit transaction to chain
                    </Button>
                </Grid.Column>
            </Grid>
        </Segment>
    );
}
