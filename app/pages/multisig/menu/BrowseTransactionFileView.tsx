import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Header } from 'semantic-ui-react';
import { parse } from '~/utils/JSONHelper';
import {
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
} from '../../../utils/types';
import routes from '../../../constants/routes.json';
import DragAndDropFile from '../../../components/DragAndDropFile';
import SimpleErrorModal, {
    ModalErrorInput,
} from '../../../components/SimpleErrorModal';

/**
 * Component that displays a drag and drop field where transaction files can
 * be dropped to initiate signing the transaction. A button can also be used
 * over the drag and drop field.
 */
export default function BrowseTransactionFileView() {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const dispatch = useDispatch();

    async function loadTransactionFile(file: Buffer) {
        const fileString = file.toString('utf-8');
        let transactionObject;
        try {
            transactionObject = parse(fileString);
        } catch (e) {
            setShowError({
                show: true,
                header: 'Invalid file',
                content:
                    'The chosen file was invalid. A file containing a multi signature transaction proposal in JSON format was expected.',
            });
            return;
        }

        // TODO Type should be defined in an ENUM instead of a string.
        let type;
        let pathname;
        if (instanceOfUpdateInstruction(transactionObject)) {
            type = 'UpdateInstruction';
            pathname = routes.MULTISIGTRANSACTIONS_COSIGN_TRANSACTION;
        } else if (instanceOfAccountTransaction(transactionObject)) {
            type = 'AccountTransaction';
            pathname = routes.MULTISIGTRANSACTIONS_COSIGN_ACCOUNT_TRANSACTION;
        } else {
            setShowError({
                show: true,
                header: 'Invalid file',
                content:
                    'The chosen file was neither an account transaction or an update instruction, and it is therefore invalid.',
            });
            return;
        }

        // The loaded file was valid, so proceed by loading the signing page for multi signature transactions.
        dispatch(
            push({
                pathname,
                state: { transaction: fileString, type },
            })
        );
    }

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
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
        </>
    );
}
