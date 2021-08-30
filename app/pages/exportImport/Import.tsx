import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Buffer } from 'buffer/';
import { decrypt } from '../../utils/encryption';
import routes from '../../constants/routes.json';
import InputModal from '../../components/InputModal';
import MessageModal from '../../components/MessageModal';
import FileInput from '../../components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import {
    passwordValidationRules,
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
    const [encryptedData, setEncryptedData] = useState<
        EncryptedData | undefined
    >();
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
    function decryptAndParseData(password: string) {
        if (!encryptedData) {
            fail('Unexpected missing data');
            return;
        }
        let decryptedData;
        try {
            decryptedData = decrypt(encryptedData, password);
        } catch (e) {
            fail('Unable to decrypt file');
            return;
        }
        let data;
        try {
            data = JSON.parse(decryptedData);
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
    async function fileProcessor(file: FileInputValue) {
        if (file) {
            const rawData = Buffer.from(await file[0].arrayBuffer());
            let parsedEncryptedData;
            try {
                parsedEncryptedData = JSON.parse(rawData.toString('utf-8'));
            } catch (e) {
                fail('This file is not a valid Export File!');
                return;
            }
            const validation = validateEncryptedStructure(parsedEncryptedData);
            if (!validation.isValid) {
                fail(`This file is invalid due to: ${validation.reason}`);
            } else {
                setEncryptedData(parsedEncryptedData);
                setPasswordModalOpen(true);
            }
        }
    }

    return (
        <>
            <InputModal
                title="Enter your password"
                text="Please enter the password you chose upon exporting your file."
                buttonText="Continue"
                validationRules={passwordValidationRules}
                buttonOnClick={decryptAndParseData}
                placeholder="Enter your password"
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
                <FileInput
                    className={styles.fileInput}
                    value={null}
                    placeholder="Drag and drop file here"
                    buttonTitle="or browse to file"
                    onChange={fileProcessor}
                />
            </div>
        </>
    );
}
