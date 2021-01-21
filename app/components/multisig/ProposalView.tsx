import React from 'react';
import { useSelector } from 'react-redux';
import fs from 'fs';
import { ipcRenderer } from 'electron';
import {
    Button,
    Checkbox,
    Divider,
    Form,
    Grid,
    Header,
    Segment,
} from 'semantic-ui-react';
import { currentProposalSelector } from '../../features/MultiSignatureSlice';
import { MultiSignatureTransaction } from './UpdateMicroGtuPerEuro';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state.
 *
 * The current transaction proposal is set either when generating a new transaction proposal,
 * or when selecting an existing transaction proposal from the multi signature transaction menu.
 */
export default function ProposalView() {
    const currentProposal: MultiSignatureTransaction | undefined = useSelector(
        currentProposalSelector
    );
    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    async function exportTransaction() {
        const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
            'SAVE_FILE_DIALOG',
            'Export transaction'
        );
        if (saveFileDialog.canceled) {
            return;
        }

        if (saveFileDialog.filePath) {
            fs.writeFile(
                saveFileDialog.filePath,
                currentProposal.transaction,
                (err) => {
                    if (err) {
                        // TODO Add error handling here.
                    }
                }
            );
        }
    }

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
                        <TransactionDetails
                            updateInstruction={JSON.parse(
                                currentProposal.transaction
                            )}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Grid.Row>
                            <Form>
                                <Form.Field>
                                    <Checkbox label="Awaiting signature" />
                                </Form.Field>
                                <Form.Field>
                                    <Checkbox label="Awaiting signature" />
                                </Form.Field>
                                <Form.Field>
                                    <Checkbox label="Awaiting signature" />
                                </Form.Field>
                            </Form>
                        </Grid.Row>
                        <Divider />
                        <Grid.Row>
                            <Segment placeholder>
                                <Header size="small">
                                    Drag and drop signatures here
                                </Header>
                                <Button primary>Or browse to file</Button>
                            </Segment>
                        </Grid.Row>
                    </Grid.Column>
                    <Grid.Column>
                        <TransactionHashView transactionHash="Hash should be here" />
                    </Grid.Column>
                </Grid>
            </Segment>
            <Grid columns="equal">
                <Grid.Column>
                    <Button fluid primary onClick={() => exportTransaction()}>
                        Export transaction proposal
                    </Button>
                </Grid.Column>
                <Grid.Column>
                    <Button fluid positive>
                        Submit transcation to chain
                    </Button>
                </Grid.Column>
            </Grid>
        </Segment>
    );
}
