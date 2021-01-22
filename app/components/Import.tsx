import React, { useState } from 'react';
import { Card, Button, Modal, Input } from 'semantic-ui-react';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import * as crypto from 'crypto';

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

async function importData(password) {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        'OPEN_FILE_DIALOG',
        'Load transaction'
    );

    if (openDialogValue.canceled) {
        return;
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        const fileString = fs.readFileSync(fileLocation, {
            encoding: 'utf-8',
        });

        let encryptedData;
        try {
            encryptedData = JSON.parse(fileString);
        } catch (e) {
            // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
            throw new Error('Input was not valid JSON.');
        }

        // TODO ensure correct structure

        const data = decrypt(encryptedData, password);
        // TODO Save the data
        console.log(JSON.parse(data));
    }
}

export default function Import() {
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);

    async function onClick() {
        await importData(password);
        setOpen(false);
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
                        Export
                    </Button>
                </Modal.Content>
            </Modal>
            <Card.Content extra>
                <Button primary onClick={() => setOpen(true)}>
                    Import
                </Button>
            </Card.Content>
        </Card>
    );
}
