import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';
import { encrypt } from '../utils/encryption';
import { saveFile } from '../utils/FileHelper';
import { loadIdentities, identitiesSelector } from '../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../features/AccountSlice';
import {
    loadAddressBook,
    addressBookSelector,
} from '../features/AddressBookSlice';
import InputModal from './InputModal';
import MessageModal from './MessageModal';

/**
 * Detailed view of the chosen identity.
 */
export default function Export() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>();

    useEffect(() => {
        loadAccounts(dispatch);
        loadIdentities(dispatch);
        loadAddressBook(dispatch);
    }, [dispatch]);

    if (
        identities === undefined ||
        accounts === undefined ||
        addressBook === undefined
    ) {
        return null;
    }

    async function onClick(password: string) {
        // We strip the identityName, as it is superfluous.
        const cleanAccounts = accounts.map((acc) => {
            const { identityName, ...other } = acc;
            return other;
        });
        const data = { accounts: cleanAccounts, identities, addressBook };
        const encrypted = encrypt(JSON.stringify(data), password);

        try {
            await saveFile(JSON.stringify(encrypted));
            setModalMessage('Export was Successful');
        } catch (error) {
            setModalMessage('Export failed');
        }
        setOpenPasswordModal(false);
        setOpenConfirmationModal(true);
    }

    return (
        <>
            <InputModal
                title="Choose a password!"
                buttonText="Export"
                validValue={(password) => password}
                buttonOnClick={onClick}
                placeholder="Enter Password"
                onClose={() => setOpenPasswordModal(false)}
                open={openPasswordModal}
            />
            <MessageModal
                title={modalMessage}
                buttonText="Ok, thanks!"
                onClose={() => setOpenConfirmationModal(false)}
                open={openConfirmationModal}
            />
            <Card fluid style={{ height: '75vh' }}>
                <Card.Header textAlign="center">Export</Card.Header>
                <Card.Description>
                    Choose what ID’s and accounts you want to export below:
                </Card.Description>
                <Card.Content extra>
                    <Button primary onClick={() => setOpenPasswordModal(true)}>
                        Export
                    </Button>
                </Card.Content>
            </Card>
        </>
    );
}
