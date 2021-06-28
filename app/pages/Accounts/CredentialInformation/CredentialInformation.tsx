import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@resources/svg/edit.svg';
import CloseButton from '~/cross-app-components/CloseButton';
import {
    Account,
    AccountInfo,
    CredentialDeploymentInformation,
} from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import CopyButton from '~/components/CopyButton';
import Card from '~/cross-app-components/Card';
import SidedRow from '~/components/SidedRow';
import {
    credentialsSelector,
    externalCredentialsSelector,
    updateExternalCredential,
} from '~/features/CredentialSlice';
import InputModal from '~/components/InputModal';
import Button from '~/cross-app-components/Button';
import {
    CREDENTIAL_NOTE_MAX_LENGTH,
    getNoteForOwnCredential,
} from '~/utils/credentialHelper';
import { identitiesSelector } from '~/features/IdentitySlice';

import styles from './CredentialInformation.module.scss';

interface CredentialOfAccount
    extends Omit<CredentialDeploymentInformation, 'regId'> {
    isOwn: boolean;
    note: string | undefined;
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
    returnFunction(): void;
}
/**
 * Displays the account's deployed credential information and the
 * signature threshold for the account.
 */
export default function CredentialInformation({
    account,
    accountInfo,
    returnFunction,
}: Props) {
    const dispatch = useDispatch();
    const [showEditNote, setShowEditNote] = useState<string | undefined>();
    const externalCredentials = useSelector(externalCredentialsSelector);
    const ownCredentials = useSelector(credentialsSelector);
    const identities = useSelector(identitiesSelector);

    const credentialsOfAccount = Object.values(accountInfo.accountCredentials)
        .map((o) => o.value.contents)
        .map((cred) => {
            let enrichedCred: CredentialOfAccount = {
                ...cred,
                isOwn: false,
                note: undefined,
            };
            // The node returns the credId in the regId field for
            // initial accounts, so we have to hack it a bit here.
            // This can safely be removed, if the node is updated to
            // be consistent and always use the credId field.
            if (cred.regId) {
                enrichedCred = { ...enrichedCred, credId: cred.regId };
            }

            const existingOwnCredential = ownCredentials.find(
                (c) => c.credId === enrichedCred.credId
            );

            const note =
                externalCredentials.find(
                    (c) => c.credId === enrichedCred.credId
                )?.note ??
                getNoteForOwnCredential(identities, existingOwnCredential);

            return { ...enrichedCred, isOwn: !!existingOwnCredential, note };
        });

    const submitNote = (credId: string) => (note: string) => {
        updateExternalCredential(dispatch, {
            accountAddress: account.address,
            credId,
            note,
        });
        setShowEditNote(undefined);
    };

    return (
        <Card className="relative pB0">
            <div className={styles.header}>
                <p className="mT0">
                    Credentials on this account: {credentialsOfAccount.length}
                </p>
                <p>Signature threshold: {account.signatureThreshold}</p>
                <CloseButton
                    className={styles.closeButton}
                    onClick={returnFunction}
                />
            </div>
            <div className={styles.credentialList}>
                {credentialsOfAccount.map((credential: CredentialOfAccount) => {
                    const { policy } = credential;
                    return (
                        <div
                            className={styles.listElement}
                            key={credential.credId}
                        >
                            <SidedRow
                                className={styles.listElementRow}
                                left="Credential ID:"
                                right={
                                    <>
                                        <CopyButton
                                            className={styles.copy}
                                            value={credential.credId}
                                        />
                                        {credential.credId.substring(0, 8)}
                                    </>
                                }
                            />
                            <SidedRow
                                className={styles.noteRow}
                                left="Note:"
                                right={
                                    <>
                                        {credential.isOwn || (
                                            <InputModal
                                                open={
                                                    showEditNote ===
                                                    credential.credId
                                                }
                                                onOpen={() =>
                                                    setShowEditNote(
                                                        credential.credId
                                                    )
                                                }
                                                onClose={() =>
                                                    setShowEditNote(undefined)
                                                }
                                                trigger={
                                                    <Button
                                                        className={
                                                            styles.editNote
                                                        }
                                                        clear
                                                    >
                                                        <EditIcon />
                                                    </Button>
                                                }
                                                title="Set note for credential"
                                                buttonText="Submit"
                                                placeholder="Add note"
                                                buttonOnClick={submitNote(
                                                    credential.credId
                                                )}
                                                defaultValue={credential.note}
                                                validationRules={{
                                                    maxLength: {
                                                        value: CREDENTIAL_NOTE_MAX_LENGTH,
                                                        message:
                                                            'Cannot be longer than 30 characters',
                                                    },
                                                }}
                                            />
                                        )}
                                        {credential.note || (
                                            <i>No note for credential</i>
                                        )}
                                    </>
                                }
                            />
                            <SidedRow
                                className={styles.listElementRow}
                                left="Date of Creation:"
                                right={formatDate(policy.createdAt)}
                            />
                            <SidedRow
                                className={styles.listElementRow}
                                left="Valid to:"
                                right={formatDate(policy.validTo)}
                            />
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
