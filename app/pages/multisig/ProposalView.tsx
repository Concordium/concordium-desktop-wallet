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
import { parse, stringify } from 'json-bigint';
import { push } from 'connected-react-router';
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
import { sendTransaction } from '../../utils/client';
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
    const dispatch = useDispatch();
    const currentProposal = useSelector(currentProposalSelector);
    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    async function loadSignatureFile(file: string) {
        let transactionObject;
        try {
            transactionObject = parse(file);
        } catch (error) {
            setShowError({
                show: true,
                header: 'Invalid file',
                content:
                    'The chosen file was invalid. A file containing a signed multi signature transaction proposal in JSON format was expected.',
            });
            return;
        }

        if (instanceOfUpdateInstruction(transactionObject)) {
            if (currentProposal) {
                const proposal: UpdateInstruction<UpdateInstructionPayload> = parse(
                    currentProposal.transaction
                );

                // If the loaded signature already exists on the proposal,
                // then show a modal to the user.
                for (
                    let i = 0;
                    i < transactionObject.signatures.length;
                    i += 1
                ) {
                    const signature = transactionObject.signatures[i];
                    if (proposal.signatures.includes(signature)) {
                        setShowError({
                            show: true,
                            header: 'Duplicate signature',
                            content:
                                'The loaded signature file contains a signature that is already present on the proposal.',
                        });
                        return;
                    }
                }

                proposal.signatures = proposal.signatures.concat(
                    transactionObject.signatures
                );
                const updatedProposal = {
                    ...currentProposal,
                    transaction: stringify(proposal),
                };

                updateCurrentProposal(dispatch, updatedProposal);
            }
        } else {
            setShowError({
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file is invalid. It should contain a signature for an account transaction or an update instruction in the exact format exported by this application.',
            });
        }
    }

    const instruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        currentProposal.transaction
    );
    const handler = findHandler(instruction);
    const serializedPayload = handler.serializePayload();

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
                                        <Form.Field key={signature}>
                                            <Checkbox
                                                label="Signed"
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
                                disabled={!missingSignatures}
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
                        onClick={() =>
                            saveFile(
                                currentProposal.transaction,
                                'Export transaction'
                            )
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
