import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import * as crypto from 'crypto';
import { loadIdentities, identitiesSelector } from '../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../features/AccountSlice';
import {
    loadAddressBook,
    addressBookSelector,
} from '../features/AddressBookSlice';

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

export default function Import() {
    async function importFunction() {
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

            // TODO prompt for password
            const password = 'test';

            console.log(encryptedData);
            const data = decrypt(encryptedData, password);

            console.log(JSON.parse(data));
        }
    }

    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header textAlign="center">Import</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
            <Card.Content extra>
                <Button primary onClick={importFunction}>
                    Import
                </Button>
            </Card.Content>
        </Card>
    );
}
