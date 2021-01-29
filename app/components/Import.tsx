import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Header, Segment } from 'semantic-ui-react';
import { decrypt } from '../utils/encryption';
import routes from '../constants/routes.json';
import InputModal from './InputModal';
import MessageModal from './MessageModal';
import DragAndDropFile from './DragAndDropFile';
import {
    validateImportStructure,
    validateEncryptedStructure,
} from '../utils/importHelpers';

export default function Import() {
    const dispatch = useDispatch();
    const [file, setFile] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    function fail(message) {
        setErrorMessage(message);
        setMessageModalOpen(true);
        setPasswordModalOpen(false);
    }

    async function modalButtonOnClick(password) {
        let decryptedFile;
        try {
            decryptedFile = decrypt(file, password);
        } catch (e) {
            fail('Unable to decrypt file');
            return;
        }
        const data = JSON.parse(decryptedFile);
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

    async function fileProcessor(rawData) {
        if (rawData) {
            let encryptedData;
            try {
                encryptedData = JSON.parse(rawData);
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
                validValue={(password) => password}
                buttonOnClick={modalButtonOnClick}
                placeholder="Enter the password you chose upon exporting your file"
                onClose={() => setPasswordModalOpen(false)}
                open={passwordModalOpen}
            />
            <MessageModal
                title={errorMessage}
                buttonText="Ok, thanks!"
                onClose={() => setMessageModalOpen(false)}
                open={messageModalOpen}
            />
            <Segment basic textAlign="center">
                <Header size="large">Import</Header>
                <DragAndDropFile
                    text="Drag and drop your file here"
                    fileProcessor={fileProcessor}
                />
            </Segment>
        </>
    );
}
