import React, { useState } from 'react';
import { Card } from 'semantic-ui-react';
import Identicon from 'react-identicons';
import { CredentialDeploymentInformation } from '../../utils/types';
import DragAndDrop from '../../components/DragAndDropFile';
import Button from '../../cross-app-components/Button';
import { CredentialStatus } from './CredentialStatus';

interface Props {
    setReady: (ready: boolean) => void;
    credentialIds: [string, CredentialStatus][];
    addCredentialId: (id: [string, CredentialStatus]) => void;
    setNewCredentials: (
        update: (
            current: CredentialDeploymentInformation[]
        ) => CredentialDeploymentInformation[]
    ) => void;
}

// TODO: Add a checkbox, which must be checked before the user can add the credential.
export default function AddCredential({
    setReady,
    credentialIds,
    addCredentialId,
    setNewCredentials,
}: Props): JSX.Element {
    const [currentCredential, setCurrentCredential] = useState<
        CredentialDeploymentInformation | undefined
    >();

    setReady(currentCredential === undefined);

    function loadCredential(file: Buffer) {
        try {
            const credential = JSON.parse(file.toString());
            if (
                !credentialIds.find(([credId]) => credId === credential.credId)
            ) {
                setCurrentCredential(credential);
            }
            // TODO: add else that informs of no duplicates.
        } catch (e) {
            // TODO: Inform of a parsing error
        }
    }

    function addCurrentCredential() {
        if (!currentCredential) {
            throw new Error('unexpected missing current credential');
        }

        addCredentialId([currentCredential.credId, CredentialStatus.Added]);
        setNewCredentials((newCredentials) => [
            ...newCredentials,
            currentCredential,
        ]);
        setCurrentCredential(undefined);
    }

    if (currentCredential) {
        return (
            <Card>
                <h2>New Credential</h2>
                <Button onClick={() => setCurrentCredential(undefined)}>
                    x
                </Button>
                {currentCredential.credId}
                <Identicon string={JSON.stringify(currentCredential)} />
                <Button onClick={addCurrentCredential}>
                    Add Credential to Proposal
                </Button>
            </Card>
        );
    }
    return (
        <>
            <h1>Do you want to propose new credentials?</h1>
            <h3>
                You can add new credentials to the proposal by dropping the
                below, or by browsing to the file on your compuiter.
            </h3>
            <DragAndDrop
                text="Drag and drop the credentials here"
                fileProcessor={loadCredential}
            />
        </>
    );
}
