import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { saveFile } from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { insertNewCredential } from '~/features/CredentialSlice';
import { addExternalAccount } from '~/features/AccountSlice';
import { findAccounts } from '~/database/AccountDao';
import generateCredentialContext from './GenerateCredentialContext';
import AccountCredentialSummary from './AccountCredentialSummary';

/**
 * Allows the user to export the created credentialInformation.
 */
export default function ExportCredential(): JSX.Element {
    const dispatch = useDispatch();
    const {
        credential: [credentialBlob],
        isReady: [, setReady],
    } = useContext(generateCredentialContext);

    async function saveCredential() {
        if (!credentialBlob?.credential) {
            throw new Error('unexpected missing credential');
        }

        const success = await saveFile(
            JSON.stringify(credentialBlob.credential),
            { title: 'Save credential' }
        );
        if (success) {
            insertNewCredential(
                dispatch,
                credentialBlob.address,
                credentialBlob.credentialNumber,
                credentialBlob.identityId,
                undefined,
                credentialBlob.credential
            );

            // The account may already exists, if the credential being exported is for an
            // internal account in the database. In that case a new one should not be created.
            const accountExists =
                (await findAccounts({ address: credentialBlob.address }))
                    .length > 0;
            if (!accountExists) {
                addExternalAccount(
                    dispatch,
                    credentialBlob.address,
                    credentialBlob.identityId,
                    1
                );
            }
            setReady(true);
        }
    }

    return (
        <AccountCredentialSummary
            Button={() => <Button onClick={saveCredential}>Export</Button>}
        />
    );
}
