import React from 'react';
import { CredentialDeploymentInformation } from '../../utils/types';
import { saveFile } from '../../utils/FileHelper';
import Button from '../../cross-app-components/Button';

interface Props {
    credential: CredentialDeploymentInformation | undefined;
    setReady: (ready: boolean) => void;
}

/**
 * Allows the user to export the created credentialInformation.
 * TODO: Fix this to reflect the sketches.
 */
export default function ExportCredential({
    credential,
    setReady,
}: Props): JSX.Element {
    async function saveCredential() {
        if (!credential) {
            throw new Error('unexpected missing credential');
        }

        const success = await saveFile(
            JSON.stringify(credential),
            'save credential'
        );
        if (success) {
            setReady(true);
        }
    }

    return <Button onClick={saveCredential}>Export</Button>;
}
