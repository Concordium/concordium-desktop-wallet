import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Header } from 'semantic-ui-react';
import {
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
} from '../../utils/types';
import routes from '../../constants/routes.json';
import DragAndDropFile from '../DragAndDropFile';

/**
 * Component that displays a drag and drop field where transaction files can
 * be dropped to initiate signing the transaction. A button can also be used
 * over the drag and drop field.
 */
export default function BrowseTransactionFileView() {
    const dispatch = useDispatch();

    async function loadTransactionFile(file: string) {
        let transactionObject;
        try {
            transactionObject = JSON.parse(file);
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

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header textAlign="center">
                    <Header>Sign a transaction</Header>
                </Card.Header>
                <DragAndDropFile
                    text="Drag and drop proposed multi signature transaction here"
                    fileProcessor={loadTransactionFile}
                />
            </Card.Content>
        </Card>
    );
}
