/* eslint-disable @typescript-eslint/no-explicit-any */
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import { Credential, CredentialWithIdentityNumber } from '~/utils/types';
import { CredentialMethods } from '~/preload/preloadTypes';

/**
 * Get all credentials for the account with the given account address. The identity
 * number is joined in from the identity table, and the walletId is joined from
 * the wallet table and augmented into the credential object.
 * @param accountAddress address of the account to get the credentials for
 * @returns an array of credentials for the given account, augmented with the identityNumber and walletId
 */
async function getCredentialsOfAccount(accountAddress: string) {
    const credentials = await (await knex())
        .select()
        .table(databaseNames.credentialsTable)
        .join(
            databaseNames.identitiesTable,
            `${databaseNames.credentialsTable}.identityId`,
            '=',
            `${databaseNames.identitiesTable}.id`
        )
        .join(
            databaseNames.walletTable,
            `${databaseNames.identitiesTable}.walletId`,
            '=',
            `${databaseNames.walletTable}.id`
        )
        .where({ accountAddress })
        .select(
            `${databaseNames.credentialsTable}.*`,
            `${databaseNames.identitiesTable}.identityNumber as identityNumber`,
            `${databaseNames.walletTable}.id as walletId`
        );
    return credentials;
}

export async function insertCredential(credential: Credential) {
    return (await knex())(databaseNames.credentialsTable).insert(credential);
}

export async function removeCredential(credential: Partial<Credential>) {
    return (await knex())(databaseNames.credentialsTable)
        .where(credential)
        .del();
}

export async function removeCredentialsOfAccount(accountAddress: string) {
    return (await knex())(databaseNames.credentialsTable)
        .where({ accountAddress })
        .del();
}

export async function getCredentials(): Promise<
    CredentialWithIdentityNumber[]
> {
    const credentials = await (await knex())
        .select()
        .table(databaseNames.credentialsTable)
        .join(
            databaseNames.identitiesTable,
            `${databaseNames.credentialsTable}.identityId`,
            '=',
            `${databaseNames.identitiesTable}.id`
        )
        .select(
            `${databaseNames.credentialsTable}.*`,
            `${databaseNames.identitiesTable}.identityNumber as identityNumber`
        );
    return credentials;
}

/**
 * Get all credentials for the given identity id, i.e. exactly those credentials
 * that refer to a specific identity.
 */
export async function getCredentialsForIdentity(
    identityId: number
): Promise<Credential[]> {
    return (await knex())
        .select()
        .table(databaseNames.credentialsTable)
        .where({ identityId });
}

export async function getNextCredentialNumber(identityId: number) {
    const credentials = await (await knex())
        .select()
        .table(databaseNames.credentialsTable)
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
        return (await knex())(databaseNames.credentialsTable)
            .where({ credId })
            .update({ credentialIndex: null });
    }
    return (await knex())(databaseNames.credentialsTable)
        .where({ credId })
        .update({ credentialIndex });
}

export async function updateCredential(
    credId: string,
    updatedValues: Partial<Credential>
) {
    return (await knex())(databaseNames.credentialsTable)
        .where({ credId })
        .update(updatedValues);
}

export async function hasDuplicateWalletId(
    accountAddress: string,
    credId: string,
    otherCredIds: string[]
) {
    const credentials = await getCredentialsOfAccount(accountAddress);
    const credential = credentials.find((cred) => cred.credId === credId);
    if (!credential) {
        return false;
    }
    const { walletId } = credential;
    const otherWalletIds = credentials
        .filter((cred) => otherCredIds.includes(cred.credId))
        .map((cred) => cred.walletId);
    return otherWalletIds.includes(walletId);
}

export async function hasExistingCredential(
    accountAddress: string,
    currentWalletId: number
) {
    const credentials = await getCredentialsOfAccount(accountAddress);
    return credentials.some((cred) => cred.walletId === currentWalletId);
}

const exposedMethods: CredentialMethods = {
    insert: insertCredential,
    delete: removeCredential,
    deleteForAccount: removeCredentialsOfAccount,
    getAll: getCredentials,
    getForIdentity: getCredentialsForIdentity,
    getForAccount: getCredentialsOfAccount,
    getNextNumber: getNextCredentialNumber,
    updateIndex: updateCredentialIndex,
    update: updateCredential,
    hasDuplicateWalletId,
    hasExistingCredential,
};
export default exposedMethods;
