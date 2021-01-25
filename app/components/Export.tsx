import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Modal, Input } from 'semantic-ui-react';
import { encrypt } from '../utils/encryption';
import { saveToFile } from '../utils/files';
import { loadIdentities, identitiesSelector } from '../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../features/AccountSlice';
import {
    loadAddressBook,
    addressBookSelector,
} from '../features/AddressBookSlice';

/**
 * Detailed view of the chosen identity.
 */
export default function Export() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [password, setPassword] = useState('');
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

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
        const data = { accounts: cleanAccounts, identities, addressBook };
        const encrypted = encrypt(JSON.stringify(data), password);
        const successful = await saveToFile(encrypted); // TODO handle error
        if (successful) {
            setOpenPasswordModal(false);
            setOpenConfirmationModal(true);
        }
    }

    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header>Export</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
            <Modal
                closeIcon
                centered
                onClose={() => setOpenPasswordModal(false)}
                open={openPasswordModal}
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
            <Modal
                centered
                open={openConfirmationModal}
                dimmer="blurring"
                closeOnDimmerClick={false}
            >
                <Modal.Header>Export was Successful</Modal.Header>
                <Modal.Content>
                    <Button
                        disabled={!password}
                        onClick={() => setOpenConfirmationModal(false)}
                    >
                        Ok, thanks!
                    </Button>
                </Modal.Content>
            </Modal>

            <Card.Content extra>
                <Button primary onClick={() => setOpenPasswordModal(true)}>
                    Export
                </Button>
            </Card.Content>
        </Card>
    );
}
