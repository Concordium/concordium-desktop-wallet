import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { decrypt } from '../../utils/encryption';
import routes from '../../constants/routes.json';
import InputModal from '../../components/InputModal';
import MessageModal from '../../components/MessageModal';
import DragAndDropFile from '../../components/DragAndDropFile';
import {
    validatePassword,
    validateImportStructure,
    validateEncryptedStructure,
} from '../../utils/importHelpers';
import { EncryptedData } from '../../utils/types';
import styles from './ExportImport.module.scss';

/**
 * Component to start importing identities/account/addressBook.
 * Allows the user to choose a file, then parses/validates/decrypts the file.
 */
export default function Import() {
    const dispatch = useDispatch();
    const [file, setFile] = useState<EncryptedData | undefined>();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    function fail(message: string) {
        setErrorMessage(message);
        setMessageModalOpen(true);
        setPasswordModalOpen(false);
    }

    // Attempts to decrypt the file, using the given password
    // then parses/validates the data.
    // If it succeeds, redirect to PerformImport to finish importing.
    async function decryptAndParseData(password: string) {
        if (!file) {
            fail('Unexpected missing data');
            return;
        }
        let decryptedFile;
        try {
            decryptedFile = decrypt(file, password);
        } catch (e) {
            fail('Unable to decrypt file');
            return;
        }
        let data;
        try {
            data = JSON.parse(decryptedFile);
        } catch (e) {
            fail('Unable to parse decrypted data!');
            return;
        }
        const validation = validateImportStructure(data);
        if (!validation.isValid) {
            fail(`This file is invalid due to: ${validation.reason}`);
        }
        dispatch(
            push({
                pathname: routes.IMPORT,
                state: data,
            })
        );
    }

    // Attempts to parse/validate the given (encrypted) data.
    async function fileProcessor(rawData: Buffer) {
        if (rawData) {
            let encryptedData;
            try {
                encryptedData = JSON.parse(rawData.toString('utf-8'));
            } catch (e) {
                fail('This file is not a valid Export File!');
                return;
            }
            const validation = validateEncryptedStructure(encryptedData);
            if (!validation.isValid) {
                fail(`This file is invalid due to: ${validation.reason}`);
            } else {
                setFile(encryptedData);
                setPasswordModalOpen(true);
            }
        }
    }

    return (
        <>
            <InputModal
                title="Enter your password"
                buttonText="Import"
                validValue={(password) => validatePassword(password)}
                buttonOnClick={decryptAndParseData}
                placeholder="Enter the password you chose upon exporting your file"
                onClose={() => setPasswordModalOpen(false)}
                type="password"
                open={passwordModalOpen}
            />
            <MessageModal
                title={errorMessage}
                buttonText="Ok, thanks!"
                onClose={() => setMessageModalOpen(false)}
                open={messageModalOpen}
            />
            <div className={styles.import}>
                <h2 className={styles.title}>Import</h2>
                <DragAndDropFile
                    text="Drag and drop your file here"
                    fileProcessor={fileProcessor}
                />
            </div>
        </>
    );
}
