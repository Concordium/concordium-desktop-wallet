import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@resources/svg/edit.svg';
import { Account, AccountInfo } from '~/utils/types';
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
import {
    CREDENTIAL_NOTE_MAX_LENGTH,
    getNoteForOwnCredential,
    getCredId,
} from '~/utils/credentialHelper';
import { identitiesSelector } from '~/features/IdentitySlice';
import DisplayIdentityAttributes from '~/components/DisplayIdentityAttributes';
import IconButton from '~/cross-app-components/IconButton';

import styles from './CredentialInformation.module.scss';

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
}
/**
 * Displays the account's deployed credential information and the
 * signature threshold for the account.
 */
export default function CredentialInformation({ account, accountInfo }: Props) {
    const dispatch = useDispatch();
    const [showEditNote, setShowEditNote] = useState<string | undefined>();
    const externalCredentials = useSelector(externalCredentialsSelector);
    const ownCredentials = useSelector(credentialsSelector);
    const identities = useSelector(identitiesSelector);

    if (!accountInfo) {
        return null;
    }

    const credentials = Object.values(accountInfo.accountCredentials).map(
        (cred) => {
            const enrichedCred = {
                ...cred.value.contents,
                credId: getCredId(cred),
                isOwn: false,
                note: undefined,
            };

            const existingOwnCredential = ownCredentials.find(
                (c) => c.credId === enrichedCred.credId
            );

            const note =
                externalCredentials.find(
                    (c) => c.credId === enrichedCred.credId
                )?.note ??
                getNoteForOwnCredential(identities, existingOwnCredential);

            return { ...enrichedCred, isOwn: !!existingOwnCredential, note };
        }
    );

    const submitNote = (credId: string) => (note: string) => {
        updateExternalCredential(dispatch, {
            accountAddress: account.address,
            credId,
            note,
        });
        setShowEditNote(undefined);
    };

    return (
        <Card className="relative pB0 pT10">
            <div className={styles.header}>
                <p className="mT0">
                    Credentials on this account: {credentials.length}
                </p>
                <p className="mT5">
                    Signature threshold: {account.signatureThreshold}
                </p>
            </div>
            <div className={styles.credentialList}>
                {credentials.map((c) => (
                    <div className={styles.listElement} key={c.credId}>
                        <SidedRow
                            className={styles.listElementRow}
                            left="Credential ID:"
                            right={
                                <>
                                    <CopyButton
                                        className={styles.copy}
                                        value={c.credId}
                                    />
                                    {c.credId.substring(0, 8)}
                                </>
                            }
                        />
                        <SidedRow
                            className={styles.noteRow}
                            left="Note:"
                            right={
                                <>
                                    {c.isOwn || (
                                        <InputModal
                                            open={showEditNote === c.credId}
                                            onOpen={() =>
                                                setShowEditNote(c.credId)
                                            }
                                            onClose={() =>
                                                setShowEditNote(undefined)
                                            }
                                            trigger={
                                                <IconButton
                                                    className={styles.editNote}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            }
                                            title="Set note for credential"
                                            buttonText="Submit"
                                            placeholder="Add note"
                                            buttonOnClick={submitNote(c.credId)}
                                            defaultValue={c.note}
                                            validationRules={{
                                                maxLength: {
                                                    value: CREDENTIAL_NOTE_MAX_LENGTH,
                                                    message: `Cannot be longer than ${CREDENTIAL_NOTE_MAX_LENGTH} characters`,
                                                },
                                            }}
                                        />
                                    )}
                                    {c.note || <i>No note for credential</i>}
                                </>
                            }
                        />
                        <SidedRow
                            className={styles.listElementRow}
                            left="Date of Creation:"
                            right={formatDate(c.policy.createdAt)}
                        />
                        <SidedRow
                            className={styles.listElementRow}
                            left="Valid to:"
                            right={formatDate(c.policy.validTo)}
                        />
                        <div className={styles.attributesRow}>
                            <em>Revealed attributes:</em>
                            <DisplayIdentityAttributes
                                className="pT10"
                                attributes={c.policy.revealedAttributes}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
