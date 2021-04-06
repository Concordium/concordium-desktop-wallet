import React, { useState, useEffect } from 'react';
import { Card } from 'semantic-ui-react';
import Identicon from 'react-identicons';
import { CredentialDeploymentInformation } from '~/utils/types';
import DragAndDrop from '~/components/DragAndDropFile';
import Button from '~/cross-app-components/Button';
import { CredentialStatus } from './CredentialStatus';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';

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

/**
 * Allows the user to input a credential.
 * This component switches between 2 views: inputtting a file, and confirming the inputted credential
 * TODO: Add a checkbox, which must be checked before the user can add the credential.
 */
export default function AddCredential({
    setReady,
    credentialIds,
    addCredentialId,
    setNewCredentials,
}: Props): JSX.Element {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [currentCredential, setCurrentCredential] = useState<
        CredentialDeploymentInformation | undefined
    >();

    useEffect(() => {
        setReady(currentCredential === undefined);
    }, [setReady, currentCredential]);

    function loadCredential(file: Buffer) {
        let credential: CredentialDeploymentInformation;
        // TODO Validate the structure of the file
        try {
            credential = JSON.parse(file.toString());
        } catch (e) {
            setShowError({
                show: true,
                header: 'Invalid Credential',
                content: 'unable to parse the file contents as a credential',
            });
            return;
        }
        if (credentialIds.find(([credId]) => credId === credential.credId)) {
            setShowError({
                show: true,
                header: 'Invalid Credential',
                content: 'No duplicate credentials allowed',
            });
            // TODO Add check that the credential belongs to this address.
        } else {
            setCurrentCredential(credential);
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
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
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
