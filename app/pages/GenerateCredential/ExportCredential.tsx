import React from 'react';
import { useDispatch } from 'react-redux';
import { saveFile } from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { CredentialBlob } from './types';
import { insertNewCredential } from '~/features/CredentialSlice';
import { addExternalAccount } from '~/features/AccountSlice';

interface Props {
    credentialBlob: CredentialBlob | undefined;
    setReady: (ready: boolean) => void;
}

/**
 * Allows the user to export the created credentialInformation.
 */
export default function ExportCredential({
    credentialBlob,
    setReady,
}: Props): JSX.Element {
    const dispatch = useDispatch();

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
            addExternalAccount(
                dispatch,
                credentialBlob.address,
                credentialBlob.identityId,
                1
            );
            setReady(true);
        }
    }

    return <Button onClick={saveCredential}>Export</Button>;
}
