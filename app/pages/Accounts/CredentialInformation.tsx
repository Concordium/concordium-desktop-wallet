import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Grid, Button } from 'semantic-ui-react';
import { credentialsSelector } from '../../features/CredentialSlice';
import { Credential, Account } from '../../utils/types';
import { formatDate } from '../../utils/timeHelpers';
import SidedRow from '../../components/SidedRow';
import CopiableListElement from '../../components/CopiableListElement';

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

    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">Release schedule</Header>
            <Grid container columns={2} divided="vertically">
                {credentials
                    .filter(
                        (credential: Credential) =>
                            credential.accountAddress === account.address
                    )
                    .map((credential: Credential) => {
                        const policy = JSON.parse(credential.policy);
                        return (
                            <>
                                <CopiableListElement
                                    key={credential.credId}
                                    title="credential ID:"
                                    value={credential.credId}
                                />
                                <SidedRow
                                    left="Date of Creation:"
                                    right={formatDate(policy.createdAt)}
                                />
                                <SidedRow
                                    left="Valid to:"
                                    right={formatDate(policy.validTo)}
                                />
                            </>
                        );
                    })}
            </Grid>
        </>
    );
}
