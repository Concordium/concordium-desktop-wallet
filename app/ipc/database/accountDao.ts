/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { knex } from '~/database/knex';
import { accountsTable, identitiesTable } from '~/constants/databaseNames.json';
import { Account } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

function convertAccountBooleans(accounts: Account[]) {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
        };
    });
}

export async function getAllAccounts(): Promise<Account[]> {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return convertAccountBooleans(accounts);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .where({ address })
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );

    return convertAccountBooleans(accounts)[0];
}

export async function insertAccount(account: Account | Account[]) {
    return (await knex())(accountsTable).insert(account);
}

export async function updateAccount(
    address: string,
    updatedValues: Partial<Account>
) {
    return (await knex())(accountsTable)
        .where({ address })
        .update(updatedValues);
}

export async function findAccounts(condition: Record<string, unknown>) {
    const accounts = await (await knex())
        .select()
        .table(accountsTable)
        .where(condition);
    return convertAccountBooleans(accounts);
}

export async function removeAccount(accountAddress: string) {
    return (await knex())(accountsTable)
        .where({ address: accountAddress })
        .del();
}

export async function removeInitialAccount(identityId: number) {
    return (await knex())(accountsTable)
        .where({ identityId, isInitial: 1 })
        .del();
}

export async function confirmInitialAccount(
    identityId: number,
    updatedValues: Partial<Account>
) {
    return (await knex())
        .select()
        .table(accountsTable)
        .where({ identityId, isInitial: 1 })
        .first()
        .update(updatedValues);
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.accounts.getAll, async (_event) => {
        return getAllAccounts();
    });

    ipcMain.handle(
        ipcCommands.database.accounts.getAccount,
        async (_event, address: string) => {
            return getAccount(address);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.insertAccount,
        async (_event, account: Account | Account[]) => {
            return insertAccount(account);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.updateAccount,
        async (_event, address: string, updatedValues: Partial<Account>) => {
            return updateAccount(address, updatedValues);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.findAccounts,
        async (_event, condition: Record<string, unknown>) => {
            return findAccounts(condition);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.removeAccount,
        async (_event, accountAddress: string) => {
            return removeAccount(accountAddress);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.removeInitialAccount,
        async (_event, identityId: number) => {
            return removeInitialAccount(identityId);
        }
    );

    ipcMain.handle(
        ipcCommands.database.accounts.confirmInitialAccount,
        async (_event, identityId: number, updatedValues: Partial<Account>) => {
            return confirmInitialAccount(identityId, updatedValues);
        }
    );
}
