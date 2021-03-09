import { CredentialDeploymentInformation } from '../utils/types';
import knex from './knex';
import { credentialsTable } from '../constants/databaseNames.json';

export async function insertCredential(
    accountAddress: string,
    credential: CredentialDeploymentInformation,
    credentialNumber: number
) {
    const parsed = {
        ...credential,
        arData: JSON.stringify(credential.arData),
        credentialPublicKeys: JSON.stringify(credential.credentialPublicKeys),
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialNumber,
    };
    return (await knex())(credentialsTable).insert(parsed);
}

export async function removeCredential(
    credential: CredentialDeploymentInformation
) {
    return (await knex())(credentialsTable).where(credential).del();
}

export async function removeCredentialsOfAccount(accountAddress: string) {
    return (await knex())(credentialsTable).where({ accountAddress }).del();
}

export async function getCredentialsOfAccount(
    accountAddress: string
): Promise<CredentialDeploymentInformation[]> {
    return (await knex())
        .select()
        .table(credentialsTable)
        .where({ accountAddress });
}

export async function getNextCredentialNumber(identityId: number) {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .where({ identityId });
    const currentNumber = credentials.reduce(
        (num, cred) => Math.max(num, cred.credentialNumber),
        0
    );
    return currentNumber + 1;
}
