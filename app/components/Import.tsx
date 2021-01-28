import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button } from 'semantic-ui-react';
import { decrypt } from '../utils/encryption';
import { loadFile } from '../utils/files';
import routes from '../constants/routes.json';
import InputModal from './InputModal';
import MessageModal from './MessageModal';
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
            fail('Unable to decrypt file! (likely incorrect password)');
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

    async function browseFilesButtonOnClick() {
        const rawData = await loadFile();
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
                title="Enter password used when exporting!"
                buttonText="Import"
                validValue={(password) => password}
                buttonOnClick={modalButtonOnClick}
                placeholder="Enter Password"
                onClose={() => setPasswordModalOpen(false)}
                open={passwordModalOpen}
            />
            <MessageModal
                title={errorMessage}
                buttonText="Ok, thanks!"
                onClose={() => setMessageModalOpen(false)}
                open={messageModalOpen}
            />
            <Card fluid style={{ height: '75vh' }}>
                <Card.Header textAlign="center">Import</Card.Header>
                <Card.Description>
                    Choose what ID’s and accounts you want to export below:
                </Card.Description>
                <Card.Content extra>
                    <Button primary onClick={browseFilesButtonOnClick}>
                        Browse to file
                    </Button>
                </Card.Content>
            </Card>
        </>
    );
}
