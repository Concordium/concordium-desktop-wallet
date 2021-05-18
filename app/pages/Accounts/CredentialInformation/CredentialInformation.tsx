import React from 'react';
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
import styles from './CredentialInformation.module.scss';

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
    const credentialsOfAccount = Object.values(accountInfo.accountCredentials)
        .map((o) => o.value.contents)
        .map((cred) => {
            // The node returns the credId in the regId field for
            // initial accounts, so we have to hack it a bit here.
            // This can safely be removed, if the node is updated to
            // be consistent and always use the credId field.
            if (cred.regId) {
                return { ...cred, credId: cred.regId };
            }
            return cred;
        });

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
                {credentialsOfAccount.map(
                    (credential: CredentialDeploymentInformation) => {
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
                    }
                )}
            </div>
        </Card>
    );
}
