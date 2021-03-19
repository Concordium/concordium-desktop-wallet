import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Grid, Divider } from 'semantic-ui-react';
import Button from '~/cross-app-components/Button';
import { credentialsSelector } from '~/features/CredentialSlice';
import { Credential, Account } from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';

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
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">
                Credentials on this account: {credentialsOfAccount.length}
            </Header>
            <Header textAlign="center">
                Signature threshold: {account.signatureThreshold}
            </Header>
            <Grid container columns={2}>
                {credentialsOfAccount.map((credential: Credential) => {
                    const policy = JSON.parse(credential.policy);
                    return (
                        <>
                            <SidedRow
                                left="Credential ID:"
                                key={credential.credId}
                                right={
                                    <>
                                        <CopyButton value={credential.credId} />
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
                            <Divider />
                        </>
                    );
                })}
            </Grid>
        </>
    );
}
