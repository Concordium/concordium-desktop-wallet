import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button, Modal, Input } from 'semantic-ui-react';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import * as crypto from 'crypto';
import routes from '../constants/routes.json';

function decrypt({ cipherText, metaData }, password) {
    // TODO: ensure this is correct.
    const { keyLen, iterations, salt, initializationVector } = metaData;
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt),
        iterations,
        keyLen,
        'sha256'
    );
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        key,
        Buffer.from(initializationVector)
    );
    let data = decipher.update(cipherText, 'hex', 'utf8');
    data += decipher.final('utf8');
    return data;
}

async function loadFile() {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        'OPEN_FILE_DIALOG',
        'Load transaction'
    );

    if (openDialogValue.canceled) {
        return undefined;
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        const fileString = fs.readFileSync(fileLocation, {
            encoding: 'utf-8',
        });

        try {
            return JSON.parse(fileString);
        } catch (e) {
            // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
            throw new Error('Input was not valid JSON.');
        }
    }
    return undefined;
}

export default function Import() {
    const dispatch = useDispatch();
    const [password, setPassword] = useState('');
    const [file, setFile] = useState('');
    const [open, setOpen] = useState(false);

    async function onClick() {
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
                    <Button disabled={!password} onClick={onClick}>
                        Import
                    </Button>
                </Modal.Content>
            </Modal>
            <Card.Content extra>
                <Button
                    primary
                    onClick={() => {
                        loadFile()
                            .then((encryptedData) => {
                                if (encryptedData !== undefined) {
                                    setFile(encryptedData);
                                    setOpen(true);
                                }
                                return true;
                            })
                            .catch(() => {
                                throw new Error('Unexpected Error');
                            });
                    }}
                >
                    Browse to file
                </Button>
            </Card.Content>
        </Card>
    );
}
