import React, { useState, useEffect, useRef } from 'react';
import Identicon from 'react-identicons';
import clsx from 'clsx';
import Card from '~/cross-app-components/Card';
import {
    CredentialDeploymentInformation,
    CredentialExportFormat,
} from '~/utils/types';
import FileInput from '~/components/Form/FileInput';
import {
    FileInputRef,
    FileInputValue,
} from '~/components/Form/FileInput/FileInput';
import Button from '~/cross-app-components/Button';
import CloseButton from '~/cross-app-components/CloseButton';
import { CredentialStatus } from './CredentialStatus';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import styles from './UpdateAccountCredentials.module.scss';

interface Props {
    setReady: (ready: boolean) => void;
    accountAddress?: string;
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
    accountAddress,
    credentialIds,
    addCredentialId,
    setNewCredentials,
}: Props): JSX.Element {
    const fileInputRef = useRef<FileInputRef>(null);
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [currentCredential, setCurrentCredential] = useState<
        CredentialDeploymentInformation | undefined
    >();

    useEffect(() => {
        setReady(currentCredential === undefined);
    }, [setReady, currentCredential]);

    useEffect(() => {
        if (showError) {
            fileInputRef.current?.reset();
        }
    }, [showError]);

    if (!accountAddress) {
        throw new Error('Unexpected missing account');
    }

    async function loadCredential(file: FileInputValue) {
        if (file) {
            const rawCredential = Buffer.from(await file[0].arrayBuffer());

            let credentialExport: CredentialExportFormat;
            try {
                credentialExport = JSON.parse(rawCredential.toString());
            } catch (e) {
                setShowError({
                    show: true,
                    header: 'Invalid Credential',
                    content: 'Unable to parse the file contents',
                });
                return;
            }
            if (
                !(
                    credentialExport.address &&
                    credentialExport.credential &&
                    credentialExport.credential.credId
                )
            ) {
                setShowError({
                    show: true,
                    header: 'Invalid Credential',
                    content:
                        'The file contents does not have the correct format',
                });
                return;
            }
            if (accountAddress !== credentialExport.address) {
                setShowError({
                    show: true,
                    header: 'Invalid Credential',
                    content:
                        'The imported credential has not been generated for the current account',
                });
                return;
            }
            if (
                credentialIds.find(
                    ([credId]) => credId === credentialExport.credential.credId
                )
            ) {
                setShowError({
                    show: true,
                    header: 'Invalid Credential',
                    content: 'No duplicate credentials allowed',
                });
            } else {
                setCurrentCredential(credentialExport.credential);
            }
        }
    }

    function addCurrentCredential(credential: CredentialDeploymentInformation) {
        addCredentialId([credential.credId, CredentialStatus.Added]);
        setNewCredentials((newCredentials) => [...newCredentials, credential]);
        setCurrentCredential(undefined);
    }

    let body;
    if (currentCredential) {
        body = (
            <Card className={styles.addingCard}>
                <div className={styles.addingCardHeader}>
                    <h2 className="mB0">New Credential:</h2>
                    <CloseButton
                        onClick={() => setCurrentCredential(undefined)}
                    />
                </div>
                <p>{currentCredential.credId}</p>
                <h3>Identicon:</h3>
                <div className="mB20">
                    <Identicon
                        size={128}
                        string={JSON.stringify(currentCredential)}
                    />
                </div>
                <Button onClick={() => addCurrentCredential(currentCredential)}>
                    Add Credential to Proposal
                </Button>
            </Card>
        );
    } else {
        body = (
            <FileInput
                className={styles.fileInput}
                value={null}
                placeholder="Drag and drop the credentials here"
                buttonTitle="Or browse to file"
                onChange={loadCredential}
                ref={fileInputRef}
            />
        );
    }
    return (
        <div className={clsx(!currentCredential && 'flexColumn flexChildFill')}>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <h3 className={styles.bold}>
                Do you want to propose new credentials?
            </h3>
            <p>
                You can add new credentials to the proposal by dropping the
                below, or by browsing to the file on your computer.
            </p>
            {body}
        </div>
    );
}
