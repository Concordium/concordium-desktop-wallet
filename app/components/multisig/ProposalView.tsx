import React from 'react';
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
import {
    currentProposalSelector,
    updateCurrentProposal,
} from '../../features/MultiSignatureSlice';
import TransactionDetails from '../TransactionDetails';
import TransactionHashView from '../TransactionHashView';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    UpdateInstruction,
} from '../../utils/types';
import { saveFile } from '../../utils/FileHelper';
import DragAndDropFile from '../DragAndDropFile';

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state. The component allows the user to export the proposal,
 * add signatures to the proposal, and if the signature threshold has been reached,
 * then the proposal can be submitted to the chain.
 */
export default function ProposalView() {
    const dispatch = useDispatch();
    const currentProposal: MultiSignatureTransaction | undefined = useSelector(
        currentProposalSelector
    );
    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    async function loadSignatureFile(file: string) {
        const transactionObject = JSON.parse(file);
        if (instanceOfUpdateInstruction(transactionObject)) {
            // TODO Validate that the signature is not already present. Give a proper error message if that is the case in a modal or something similar.

            if (currentProposal) {
                const proposal: UpdateInstruction = JSON.parse(
                    currentProposal.transaction
                );
                proposal.signatures = proposal.signatures.concat(
                    transactionObject.signatures
                );
                const updatedProposal = {
                    ...currentProposal,
                    transaction: JSON.stringify(proposal),
                };

                updateCurrentProposal(dispatch, updatedProposal);
            }
        } else {
            throw new Error(
                'Unsupported transaction type. Not yet implemented.'
            );
        }
    }

    const instruction: UpdateInstruction = JSON.parse(
        currentProposal.transaction
    );

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
                        <TransactionDetails updateInstruction={instruction} />
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
                        <TransactionHashView transactionHash="Hash should be here" />
                    </Grid.Column>
                </Grid>
            </Segment>
            <Grid columns="equal">
                <Grid.Column>
                    <Button
                        fluid
                        primary
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
                    <Button fluid positive disabled={missingSignatures}>
                        Submit transcation to chain
                    </Button>
                </Grid.Column>
            </Grid>
        </Segment>
    );
}
