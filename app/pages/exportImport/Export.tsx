import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Header, Segment, Divider } from 'semantic-ui-react';
import { encrypt } from '../../utils/encryption';
import { validatePassword } from '../../utils/importHelpers';
import { saveFile } from '../../utils/FileHelper';
import { identitiesSelector } from '../../features/IdentitySlice';
import { accountsSelector } from '../../features/AccountSlice';
import { addressBookSelector } from '../../features/AddressBookSlice';
import InputModal from '../../components/InputModal';
import MessageModal from '../../components/MessageModal';

/**
 * Component for exporting identities/account/addressBook.
 * TODO: allow partial export
 */
export default function Export() {
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>('');

    if (
        identities === undefined ||
        accounts === undefined ||
        addressBook === undefined
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
        const data = { accounts: cleanAccounts, identities, addressBook };
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
                title="Choose a password"
                buttonText="Export"
                validValue={(password) => validatePassword(password)}
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
