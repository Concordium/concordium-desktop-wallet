import React from 'react';
import { useSelector } from 'react-redux';
import CloseButton from '~/cross-app-components/CloseButton';
import { credentialsSelector } from '~/features/CredentialSlice';
import { Credential, Account } from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import CopyButton from '~/components/CopyButton';
import styles from './CredentialInformation.module.scss';
import Card from '~/cross-app-components/Card';

interface RowProps {
    left: string | JSX.Element;
    right: string | JSX.Element;
}

function SidedRow({ left, right }: RowProps): JSX.Element {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={styles.row}>
            <div className={styles.left}>{left}</div>
            <div className={styles.right}>{right}</div>
        </div>
    );
}

interface Props {
    account: Account;
    returnFunction(): void;
}
/**
 * Displays the account's release schedule:
 * Each release (amount and time)
 * and the total locked value.
 */
export default function CredentialInformation({
    account,
    returnFunction,
}: Props) {
    const credentials = useSelector(credentialsSelector);
    const credentialsOfAccount = credentials.filter(
        (credential: Credential) =>
            credential.accountAddress === account.address &&
            credential.credentialIndex !== undefined
    );

    return (
        <Card>
            <div className={styles.header}>
                <p>
                    {' '}
                    Credentials on this account: {
                        credentialsOfAccount.length
                    }{' '}
                </p>
                <p> Signature threshold: {account.signatureThreshold} </p>
                <CloseButton onClick={returnFunction} />
            </div>
            {credentialsOfAccount.map((credential: Credential) => {
                const policy = JSON.parse(credential.policy);
                return (
                    <div className={styles.listElement} key={credential.credId}>
                        <SidedRow
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
                            left="Date of Creation:"
                            right={formatDate(policy.createdAt)}
                        />
                        <SidedRow
                            left="Valid to:"
                            right={formatDate(policy.validTo)}
                        />
                    </div>
                );
            })}
        </Card>
    );
}
