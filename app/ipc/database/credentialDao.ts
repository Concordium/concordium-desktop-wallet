/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { knex } from '~/database/knex';
import {
    credentialsTable,
    identitiesTable,
    walletTable,
} from '~/constants/databaseNames.json';
import { Credential, CredentialWithIdentityNumber } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

async function getCredentialsOfAccount(accountAddress: string) {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .join(
            identitiesTable,
            `${credentialsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .join(
            walletTable,
            `${identitiesTable}.walletId`,
            '=',
            `${walletTable}.id`
        )
        .where({ accountAddress })
        .select(
            `${credentialsTable}.*`,
            `${identitiesTable}.identityNumber as identityNumber`,
            `${walletTable}.id as walletId`
        );
    return credentials;
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

export async function getCredentials(): Promise<
    CredentialWithIdentityNumber[]
> {
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
    return credentials;
}

export async function getCredentialsForIdentity(
    identityId: number
): Promise<Credential[]> {
    return (await knex())
        .select()
        .table(credentialsTable)
        .where({ identityId });
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

export async function updateCredential(
    credId: string,
    updatedValues: Partial<Credential>
) {
    return (await knex())(credentialsTable)
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

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.credentials.insert,
        async (_event, credential: Credential) => {
            return insertCredential(credential);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.delete,
        async (_event, credential: Credential) => {
            return removeCredential(credential);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.deleteForAccount,
        async (_event, accountAddress: string) => {
            return removeCredentialsOfAccount(accountAddress);
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.credentials.getAll, async (_event) => {
        return getCredentials();
    });

    ipcMain.handle(
        ipcCommands.database.credentials.getForIdentity,
        async (_event, identityId: number) => {
            return getCredentialsForIdentity(identityId);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.getForAccount,
        async (_event, accountAddress: string) => {
            return getCredentialsOfAccount(accountAddress);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.getNextNumber,
        async (_event, identityId: number) => {
            return getNextCredentialNumber(identityId);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.updateIndex,
        async (_event, credId: string, credentialIndex: number | undefined) => {
            return updateCredentialIndex(credId, credentialIndex);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.update,
        async (_event, credId: string, updatedValues: Partial<Credential>) => {
            return updateCredential(credId, updatedValues);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.hasDuplicateWalletId,
        async (
            _event,
            accountAddress: string,
            credId: string,
            otherCredIds: string[]
        ) => {
            return hasDuplicateWalletId(accountAddress, credId, otherCredIds);
        }
    );

    ipcMain.handle(
        ipcCommands.database.credentials.hasExistingCredential,
        async (_event, accountAddress: string, currentWalletId: number) => {
            return hasExistingCredential(accountAddress, currentWalletId);
        }
    );
}
