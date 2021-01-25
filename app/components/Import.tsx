import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button } from 'semantic-ui-react';
import { decrypt } from '../utils/encryption';
import { loadFile } from '../utils/files';
import routes from '../constants/routes.json';
import InputModal from './InputModal';
import MessageModal from './MessageModal';

export default function Import() {
    const dispatch = useDispatch();
    const [file, setFile] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    async function modalButtonOnClick(password) {
        let decryptedFile;
        try {
            decryptedFile = decrypt(file, password);
        } catch (e) {
            setPasswordModalOpen(false);
            setErrorMessage(
                'Unable to decrypt file! (likely incorrect password)'
            );
            setMessageModalOpen(true);
            return;
        }

        const data = JSON.parse(decryptedFile);
        // TODO ensure data has the correct structure
        setPasswordModalOpen(false);
        dispatch(
            push({
                pathname: routes.IMPORT,
                state: data,
            })
        );
    }

    async function browseFilesButtonOnClick() {
        const rawData = await loadFile();
        let encryptedData;
        try {
            encryptedData = JSON.parse(rawData);
            // TODO ensure data has correct structure
        } catch (e) {
            setPasswordModalOpen(false);
            setErrorMessage('This file is not a valid Export File!');
            setMessageModalOpen(true);
            return;
        }
        if (encryptedData !== undefined) {
            setFile(encryptedData);
            setPasswordModalOpen(true);
        }
    }
    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header textAlign="center">Import</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
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
            <Card.Content extra>
                <Button primary onClick={browseFilesButtonOnClick}>
                    Browse to file
                </Button>
            </Card.Content>
        </Card>
    );
}
