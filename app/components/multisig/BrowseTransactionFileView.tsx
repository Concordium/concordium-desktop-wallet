import React from 'react';
import fs from 'fs';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { ipcRenderer } from 'electron';
import { Button, Card, Header, Icon, Segment } from 'semantic-ui-react';
import {
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
} from '../../utils/types';
import routes from '../../constants/routes.json';

/**
 * Component that displays a drag and drop field where transaction files can
 * be dropped to initiate signing the transaction. A button can also be used
 * over the drag and drop field.
 */
export default function BrowseTransactionFileView() {
    const dispatch = useDispatch();

    // Promps the user for a file.
    async function loadTransactionFile() {
        const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
            'OPEN_FILE_DIALOG',
            'Load transaction'
        );

        if (openDialogValue.canceled) {
            return;
        }

        if (openDialogValue.filePaths.length === 1) {
            const transactionFileLocation = openDialogValue.filePaths[0];
            const transactionString = fs.readFileSync(transactionFileLocation, {
                encoding: 'utf-8',
            });

            let transactionObject;
            try {
                transactionObject = JSON.parse(transactionString);
            } catch (e) {
                // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
                throw new Error('Input was not valid JSON.');
            }

            // TODO Type should be defined in an ENUM instead of a string.
            let type;
            if (instanceOfUpdateInstruction(transactionObject)) {
                type = 'UpdateInstruction';
            } else if (instanceOfAccountTransaction(transactionObject)) {
                // TODO Implement account transaction handler and set it here.
                throw new Error('Not implemented yet.');
            } else {
                // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
                throw new Error('Invalid input.');
            }

            // The loaded file was valid, so proceed by loading the signing page for multi signature transactions.
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                    state: { transaction: transactionObject, type },
                })
            );
        }
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header textAlign="center">
                    <Header>Sign a transaction</Header>
                </Card.Header>
                <Segment placeholder>
                    <Header icon>
                        <Icon name="file" />
                        Drag and drop proposed multi signature transaction here.
                    </Header>
                    <Button primary onClick={loadTransactionFile}>
                        Or browse to file
                    </Button>
                </Segment>
            </Card.Content>
        </Card>
    );
}
