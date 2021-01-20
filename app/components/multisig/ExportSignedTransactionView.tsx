import React from 'react';
import fs from 'fs';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
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
import routes from '../../constants/routes.json';
import { UpdateInstruction } from '../../utils/types';
import TransactionHashView from './TransactionHashView';
import TransactionDetails from './TransactionDetails';

/**
 * Component that contains a button for exporting the signed transaction that is
 * currently being processed.
 */
export default function ExportSignedTransactionView(props) {
    const dispatch = useDispatch();

    const { signature } = props.location.state;
    const updateInstruction: UpdateInstruction =
        props.location.state.transaction;
    const { transactionHash } = props.location.state;

    async function exportSignedTransaction() {
        const signedTransaction = {
            ...updateInstruction,
            signatures: [signature],
        };
        const signedTransactionJson = JSON.stringify(signedTransaction);

        const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
            'SAVE_FILE_DIALOG',
            'Export signed transaction'
        );
        if (saveFileDialog.canceled) {
            return;
        }

        if (saveFileDialog.filePath) {
            fs.writeFile(
                saveFileDialog.filePath,
                signedTransactionJson,
                (err) => {
                    if (err) {
                        // TODO Better error handling here.
                        console.error(`Unable to export transaction: ${err}`);
                    }

                    // Navigate back to the multi signature front page.
                    dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS }));
                }
            );
        }
    }

    return (
        <Segment>
            <Header textAlign="center">
                Transaction signing confirmation | Transaction Type
            </Header>
            <Divider />
            <Grid columns={2} divided textAlign="center" padded>
                <Grid.Row>
                    <Grid.Column>
                        <TransactionDetails
                            updateInstruction={updateInstruction}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <TransactionHashView
                            transactionHash={transactionHash}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Form>
                        <Form.Field>
                            <Checkbox
                                label="The hash matches the one received exactly"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                label="The picture matches the one received exactly"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                label="The transaction details are correct"
                                defaultChecked
                                readOnly
                            />
                        </Form.Field>
                        <Form.Field>
                            <Button
                                primary
                                fluid
                                onClick={exportSignedTransaction}
                            >
                                Export signed transaction
                            </Button>
                        </Form.Field>
                    </Form>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}
