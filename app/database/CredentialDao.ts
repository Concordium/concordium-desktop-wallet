import { Credential } from '../utils/types';
import knex from './knex';
import { credentialsTable } from '../constants/databaseNames.json';

export async function insertCredential(credential: Credential) {
    return (await knex())(credentialsTable).insert(credential);
}

export async function removeCredential(credential: Partial<Credential>) {
    return (await knex())(credentialsTable).where(credential).del();
}

export async function removeCredentialsOfAccount(accountAddress: string) {
    return (await knex())(credentialsTable).where({ accountAddress }).del();
}

export async function getCredentials(): Promise<Credential[]> {
    return (await knex()).select().table(credentialsTable);
}

export async function getCredentialsOfAccount(
    accountAddress: string
): Promise<Credential[]> {
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

export async function updateCredentialIndex(
    credId: string,
    credentialIndex: number | undefined
) {
    if (credentialIndex === undefined) {
        return (await knex())(credentialsTable)
            .where({ credId })
            .update({ credentialIndex: null });
    }
    return (await knex())(credentialsTable)
        .where({ credId })
        .update({ credentialIndex });
}
