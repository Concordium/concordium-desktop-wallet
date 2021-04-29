import { Credential } from '../utils/types';
import knex from './knex';
import {
    credentialsTable,
    identitiesTable,
} from '../constants/databaseNames.json';

function convertBooleans(credentials: Credential[]) {
    return credentials.map((credential) => {
        return {
            ...credential,
            external: Boolean(credential.external),
        };
    });
}

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
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .join(
            identitiesTable,
            `${credentialsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${credentialsTable}.*`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return convertBooleans(credentials);
}

/**
 * Get all credentials for the account with the given account address. The identity
 * number is joined in from the identity table and augmented to the credential object.
 * @param accountAddress address of the account to get the credentials for
 * @returns an array of credentials for the given account, augmented with the identityNumber
 */
export async function getCredentialsOfAccount(
    accountAddress: string
): Promise<Credential[]> {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .join(
            identitiesTable,
            `${credentialsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .where({ accountAddress })
        .select(
            `${credentialsTable}.*`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return convertBooleans(credentials);
}

export async function getNextCredentialNumber(identityId: number) {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .where({ identityId });
    if (credentials.length === 0) {
        return 0;
    }
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
