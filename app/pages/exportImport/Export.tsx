import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { encrypt } from '../../utils/encryption';
import { validatePassword } from '../../utils/importHelpers';
import { saveFile } from '../../utils/FileHelper';
import { identitiesSelector } from '../../features/IdentitySlice';
import { accountsSelector } from '../../features/AccountSlice';
import { addressBookSelector } from '../../features/AddressBookSlice';
import { credentialsSelector } from '../../features/CredentialSlice';
import InputModal from '../../components/InputModal';
import MessageModal from '../../components/MessageModal';
import Button from '~/cross-app-components/Button';
import styles from './ExportImport.module.scss';

/**
 * Component for exporting identities/account/addressBook.
 * TODO: allow partial export
 */
export default function Export() {
    const accounts = useSelector(accountsSelector);
    const credentials = useSelector(credentialsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    if (
        identities === undefined ||
        accounts === undefined ||
        addressBook === undefined ||
        credentials === undefined
    ) {
        return null;
    }

    async function exportData(password: string) {
        // We strip the identityName, as it is superfluous.
        // We strip the maxTransactionId, because the transactions are not exported
        const cleanAccounts = accounts.map((acc) => {
            const { identityName, maxTransactionId, ...other } = acc;
            return other;
        });
        const data = {
            accounts: cleanAccounts,
            identities,
            addressBook,
            credentials,
        };
        const encrypted = encrypt(JSON.stringify(data), password);

        try {
            const completed = await saveFile(
                JSON.stringify(encrypted),
                'Export your data'
            );
            if (completed) {
                setModalMessage('Export was successful');
                setOpenConfirmationModal(true);
            }
        } catch (error) {
            setModalMessage(
                'Export was unsuccessful, We were unable to save to file.'
            );
            setOpenConfirmationModal(true);
        }
        setOpenPasswordModal(false);
    }

    return (
        <>
            <InputModal
                title="Enter a password"
                text="Please enter a password for your export"
                buttonText="Continue"
                validValue={(password) =>
                    validatePassword(password) ? undefined : 'Invalid password'
                }
                buttonOnClick={exportData}
                placeholder="password"
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
            <div className={styles.export}>
                <h2 className={styles.title}>Export</h2>
                <p>Export your accounts, ID’s and address book.</p>
                <Button onClick={() => setOpenPasswordModal(true)}>
                    Export
                </Button>
            </div>
        </>
    );
}
