import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { encrypt } from '../../utils/encryption';
import { saveFile } from '../../utils/FileHelper';
import { identitiesSelector } from '../../features/IdentitySlice';
import { accountsSelector } from '../../features/AccountSlice';
import { addressBookSelector } from '../../features/AddressBookSlice';
import {
    credentialsSelector,
    externalCredentialsSelector,
} from '../../features/CredentialSlice';
import MessageModal from '../../components/MessageModal';
import Button from '~/cross-app-components/Button';
import styles from './ExportImport.module.scss';
import { getAllWallets } from '~/database/WalletDao';
import SetPasswordModal from '~/components/SetPasswordModal';
import { getGenesis } from '~/database/GenesisDao';

/**
 * Component for exporting wallets, identities, credentials, accounts and
 * the address book.
 */
export default function Export() {
    const accounts = useSelector(accountsSelector);
    const credentials = useSelector(credentialsSelector);
    const externalCredentials = useSelector(externalCredentialsSelector);
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
        // We strip the identityName and identityNumber as it is superfluous.
        // We strip the maxTransactionId, because the transactions are not exported
        const cleanAccounts = accounts.map((acc) => {
            const {
                identityName,
                identityNumber,
                maxTransactionId,
                ...other
            } = acc;
            return other;
        });

        // We strip the identityNumber as it is not part of the database
        // model for credentials, but is joined into the object in memory.
        const cleanCredentials = credentials.map((cred) => {
            const { identityNumber, ...other } = cred;
            return other;
        });

        const wallets = await getAllWallets();
        const genesis = await getGenesis();

        const data = {
            accounts: cleanAccounts,
            identities,
            addressBook,
            credentials: cleanCredentials,
            externalCredentials,
            wallets,
            genesis,
        };
        const encrypted = encrypt(JSON.stringify(data), password);

        try {
            const completed = await saveFile(JSON.stringify(encrypted), {
                title: 'Export your data',
                defaultPath: 'wallet-export.json',
            });
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
            <SetPasswordModal
                title="Enter a password"
                description="Please enter a password for your export"
                buttonText="Continue"
                onSubmit={exportData}
                onClose={() => setOpenPasswordModal(false)}
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
                <Button
                    className={styles.exportButton}
                    onClick={() => setOpenPasswordModal(true)}
                >
                    Export
                </Button>
            </div>
        </>
    );
}
