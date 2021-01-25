import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button, Modal, Input } from 'semantic-ui-react';
import { decrypt } from '../utils/encryption';
import { loadFile } from '../utils/files';
import routes from '../constants/routes.json';

export default function Import() {
    const dispatch = useDispatch();
    const [password, setPassword] = useState('');
    const [file, setFile] = useState('');
    const [open, setOpen] = useState(false);

    async function modalButtonOnClick() {
        const data = JSON.parse(decrypt(file, password));
        // TODO ensure correct structure
        setOpen(false);
        return dispatch(
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
        } catch (e) {
            // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
            throw new Error('Input was not valid JSON.');
        }
        if (encryptedData !== undefined) {
            setFile(encryptedData);
            setOpen(true);
        }
    }
    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header textAlign="center">Import</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
            <Modal
                closeIcon
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                dimmer="blurring"
                closeOnDimmerClick={false}
            >
                <Modal.Header>Choose a password!</Modal.Header>
                <Modal.Content>
                    <Input
                        fluid
                        name="name"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <Button disabled={!password} onClick={modalButtonOnClick}>
                        Import
                    </Button>
                </Modal.Content>
            </Modal>
            <Card.Content extra>
                <Button primary onClick={browseFilesButtonOnClick}>
                    Browse to file
                </Button>
            </Card.Content>
        </Card>
    );
}
