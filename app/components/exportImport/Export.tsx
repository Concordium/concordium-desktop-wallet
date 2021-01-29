import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Header, Segment, Divider } from 'semantic-ui-react';
import { encrypt } from '../../utils/encryption';
import { saveFile } from '../../utils/FileHelper';
import {
    loadIdentities,
    identitiesSelector,
} from '../../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../../features/AccountSlice';
import {
    loadAddressBook,
    addressBookSelector,
} from '../../features/AddressBookSlice';
import InputModal from '../InputModal';
import MessageModal from '../MessageModal';

/**
 * Component for exporting identities/account/addressBook.
 * TODO: allow partial export
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

    async function exportData(password: string) {
        // We strip the identityName, as it is superfluous.
        const cleanAccounts = accounts.map((acc) => {
            const { identityName, ...other } = acc;
            return other;
        });
        const data = { accounts: cleanAccounts, identities, addressBook };
        const encrypted = encrypt(JSON.stringify(data), password);

        try {
            await saveFile(JSON.stringify(encrypted));
            setModalMessage('Export was successful');
        } catch (error) {
            // Export was cancelled.
            // TODO: inform user in the case where export was not canceled, but did indeed fail.
        }
        setOpenPasswordModal(false);
        setOpenConfirmationModal(true);
    }

    return (
        <>
            <InputModal
                title="Choose a password"
                buttonText="Export"
                validValue={(password) => password}
                buttonOnClick={exportData}
                placeholder="Enter your password"
                onClose={() => setOpenPasswordModal(false)}
                type="password"
                open={openPasswordModal}
            />
            <MessageModal
                title={modalMessage}
                buttonText="Ok, thanks!"
                onClose={() => setOpenConfirmationModal(false)}
                open={openConfirmationModal}
            />
            <Segment basic textAlign="center">
                <Header textAlign="center" size="large">
                    Export
                </Header>
                Here you can choose to export all your identities, accounts and
                the address book.
                <Divider hidden />
                <Button
                    primary
                    onClick={() => setOpenPasswordModal(true)}
                    fluid
                >
                    Export
                </Button>
            </Segment>
        </>
    );
}
