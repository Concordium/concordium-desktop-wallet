import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { parse } from '~/utils/JSONHelper';
import {
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import FileInput from '~/components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import styles from './BrowseTransactionFile.module.scss';

/**
 * Component that displays a drag and drop field where transaction files can
 * be dropped to initiate signing the transaction. A button can also be used
 * over the drag and drop field.
 */
export default function BrowseTransactionFile() {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const dispatch = useDispatch();
    const [files, setFiles] = useState<FileInputValue>(null);

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
        if (instanceOfUpdateInstruction(transactionObject)) {
            type = 'UpdateInstruction';
        } else if (instanceOfAccountTransaction(transactionObject)) {
            type = 'AccountTransaction';

            if (!transactionObject.nonce) {
                setShowError({
                    show: true,
                    header: 'Missing nonce',
                    content:
                        'The chosen file contains an account transaction without a nonce value and it is therefore invalid.',
                });
                return;
            }
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
                pathname: routes.MULTISIGTRANSACTIONS_COSIGN_TRANSACTION,
                state: { transaction: fileString, type },
            })
        );
    }

    useEffect(() => {
        if (files) {
            files
                .item(0)
                ?.arrayBuffer()
                .then((ab) => Buffer.from(ab))
                .then(loadTransactionFile);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }, [files]);

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <FileInput
                className={styles.input}
                placeholder="Drag and drop file here"
                buttonTitle="Or browse to file"
                value={files}
                onChange={setFiles}
                disableFileNames
            />
        </>
    );
}
