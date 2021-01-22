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

function encrypt(data, password) {
    // TODO: ensure this is correct.
    const keyLen = 32;
    const iterations = 10000;
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha256');
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        key,
        initializationVector
    );
    let cipherText = cipher.update(data, 'utf8', 'hex');
    cipherText += cipher.final('hex');
    return {
        cipherText,
        metaData: {
            keyLen,
            iterations,
            salt,
            initializationVector,
        },
    };
}

/**
 * Detailed view of the chosen identity.
 */
export default function Export() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);

    useEffect(() => {
        loadAccounts(dispatch);
        loadIdentities(dispatch);
        loadAddressBook(dispatch);
    }, [dispatch]);

    if (identities === undefined || accounts === undefined) {
        return null;
    }

    async function exportData() {
        const data = {
            accounts,
            identities,
            addressBook,
        };
        // TODO prompt for password
        const encrypted = encrypt(JSON.stringify(data), 'test');

        const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
            'SAVE_FILE_DIALOG',
            'Export signed transaction'
        );
        if (saveFileDialog.canceled) {
            return;
        }

        if (saveFileDialog.filePath) {
            fs.writeFile(
                saveFileDialog.filePath,
                JSON.stringify(encrypted),
                (err) => {
                    if (err) {
                        console.log(err);
                        // TODO Add error handling here.
                    }
                    console.log('no error');
                    // TODO Announce succesfull export
                }
            );
        }
    }

    return (
        <Card>
            <Card.Header>Export</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
            <Button primary onClick={exportData}>
                Export
            </Button>
        </Card>
    );
}
