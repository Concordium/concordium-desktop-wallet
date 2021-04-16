import React, { useState, useEffect } from 'react';
import Identicon from 'react-identicons';
import Card from '~/cross-app-components/Card';
import { CredentialDeploymentInformation } from '~/utils/types';
import FileInput from '~/components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import Button from '~/cross-app-components/Button';
import CloseButton from '~/cross-app-components/CloseButton';
import { CredentialStatus } from './CredentialStatus';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import styles from './UpdateAccountCredentials.module.scss';

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

    async function loadCredential(file: FileInputValue) {
        if (file) {
            const rawCredential = Buffer.from(await file[0].arrayBuffer());

            let credential: CredentialDeploymentInformation;
            // TODO Validate the structure of the file
            try {
                credential = JSON.parse(rawCredential.toString());
            } catch (e) {
                setShowError({
                    show: true,
                    header: 'Invalid Credential',
                    content:
                        'unable to parse the file contents as a credential',
                });
                return;
            }
            if (
                credentialIds.find(([credId]) => credId === credential.credId)
            ) {
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
    }

    function addCurrentCredential(credential: CredentialDeploymentInformation) {
        addCredentialId([credential.credId, CredentialStatus.Added]);
        setNewCredentials((newCredentials) => [...newCredentials, credential]);
        setCurrentCredential(undefined);
    }

    if (currentCredential) {
        return (
            <Card className={styles.addingCard}>
                <h2>
                    New Credential{' '}
                    <CloseButton
                        onClick={() => setCurrentCredential(undefined)}
                    />
                </h2>
                <p>{currentCredential.credId}</p>
                <Identicon
                    size={128}
                    string={JSON.stringify(currentCredential)}
                />
                <Button onClick={() => addCurrentCredential(currentCredential)}>
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
            <FileInput
                value={null}
                placeholder="Drag and drop the credentials here"
                buttonTitle="Or browse to file"
                onChange={loadCredential}
            />
        </>
    );
}
