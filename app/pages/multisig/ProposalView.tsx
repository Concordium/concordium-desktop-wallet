import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Button,
    Checkbox,
    Divider,
    Form,
    Grid,
    Header,
    Segment,
} from 'semantic-ui-react';
import { parse } from 'json-bigint';
import { currentProposalSelector } from '../../features/MultiSignatureSlice';
import TransactionDetails from '../../components/TransactionDetails';
import TransactionHashView from '../../components/TransactionHashView';
import {
    MultiSignatureTransactionStatus,
    UpdateInstructionSignature,
    Transaction,
} from '../../utils/types';
import { saveFile } from '../../utils/FileHelper';
import DragAndDropFile from '../../components/DragAndDropFile';
import SimpleErrorModal, {
    ModalErrorInput,
} from '../../components/SimpleErrorModal';
import PageLayout from '../../components/PageLayout';
import {
    TransactionCredentialSignature,
    instanceOfUpdateInstructionSignature,
} from '../../utils/transactionTypes';

export interface ProposalError {
    show: boolean;
    header: string;
    content: string;
}

interface Props {
    title: string;
    transaction: Transaction;
    transactionHash: string;
    signatures: TransactionCredentialSignature[] | UpdateInstructionSignature[];
    handleSignatureFile: (
        transactionObject: Transaction
    ) => Promise<ModalErrorInput | undefined>;
    submitTransaction: () => void;
}

function displaySignature(
    signature: TransactionCredentialSignature | UpdateInstructionSignature
) {
    if (instanceOfUpdateInstructionSignature(signature)) {
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
    }
    // TODO: Remove assumption that a credential only has 1 signature
    const sig = signature[0].toString('hex');
    return (
        <Form.Field key={sig}>
            <Checkbox
                label={`Signed (${sig.substring(0, 16)}...)`}
                defaultChecked
                readOnly
            />
        </Form.Field>
    );
}

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state. The component allows the user to export the proposal,
 * add signatures to the proposal, and if the signature threshold has been reached,
 * then the proposal can be submitted to a node.
 */
export default function ProposalView({
    title,
    transaction,
    transactionHash,
    signatures,
    handleSignatureFile,
    submitTransaction,
}: Props) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [currentlyLoadingFile, setCurrentlyLoadingFile] = useState(false);
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

        const error = await handleSignatureFile(transactionObject);
        if (error) {
            setShowError(error);
        }
        setCurrentlyLoadingFile(false);
    }

    const unsignedCheckboxes = [];
    for (let i = 0; i < currentProposal.threshold - signatures.length; i += 1) {
        unsignedCheckboxes.push(
            <Form.Field key={i}>
                <Checkbox label="Awaiting signature" readOnly />
            </Form.Field>
        );
    }

    const missingSignatures = signatures.length !== currentProposal.threshold;

    const readyToSubmit =
        !missingSignatures &&
        currentProposal.status === MultiSignatureTransactionStatus.Open;

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{title}</h1>
            </PageLayout.Header>
            <Segment secondary textAlign="center">
                <SimpleErrorModal
                    show={showError.show}
                    header={showError.header}
                    content={showError.content}
                    onClick={() => setShowError({ show: false })}
                />
                <Header size="large">Your transaction proposal</Header>
                <Segment basic>
                    Your transaction proposal has been generated. An overview
                    can be seen below.
                </Segment>
                <Segment>
                    <Header>Transaction Proposal | Transaction Type</Header>
                    <Divider />
                    <Grid columns={3} divided textAlign="center" padded>
                        <Grid.Column>
                            <TransactionDetails transaction={transaction} />
                        </Grid.Column>
                        <Grid.Column>
                            <Grid.Row>
                                <Form>
                                    {signatures.map(displaySignature)}
                                    {unsignedCheckboxes}
                                </Form>
                            </Grid.Row>
                            <Divider />
                            <Grid.Row>
                                <DragAndDropFile
                                    text="Drag and drop signatures here"
                                    fileProcessor={loadSignatureFile}
                                    disabled={
                                        !missingSignatures ||
                                        currentlyLoadingFile
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
                            disabled={!readyToSubmit}
                            onClick={submitTransaction}
                        >
                            Submit transaction to chain
                        </Button>
                    </Grid.Column>
                </Grid>
            </Segment>
        </PageLayout>
    );
}
