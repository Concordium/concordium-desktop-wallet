import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Modal, Input } from 'semantic-ui-react';
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

async function exportData(data, password) {
    const encrypted = encrypt(JSON.stringify(data), password);

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
                    // TODO Add error handling here.
                }
                // TODO Announce succesfull export
            }
        );
    }
}

/**
 * Detailed view of the chosen identity.
 */
export default function Export() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadAccounts(dispatch);
        loadIdentities(dispatch);
        loadAddressBook(dispatch);
    }, [dispatch]);

    if (identities === undefined || accounts === undefined) {
        return null;
    }

    async function onClick() {
        const cleanAccounts = accounts.map((acc) => {
            const { identityName, ...other } = acc;
            return other;
        });
        await exportData(
            { accounts: cleanAccounts, identities, addressBook },
            password
        );
        setOpen(false);
    }

    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header>Export</Card.Header>
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
                    Export
                </Button>
            </Card.Content>
        </Card>
    );
}
