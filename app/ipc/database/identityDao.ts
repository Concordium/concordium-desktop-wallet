/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { knex } from '~/database/knex';
import { identitiesTable } from '~/constants/databaseNames.json';
import ipcCommands from '~/constants/ipcCommands.json';
import { Identity } from '~/utils/types';

export async function getNextIdentityNumber(walletId: number): Promise<number> {
    const model = (await knex())
        .table(identitiesTable)
        .where('walletId', walletId);
    const totalCount = await model.clone().count();
    return parseInt(totalCount[0]['count(*)'].toString(), 10);
}

async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return (await knex())(identitiesTable).insert(identity);
}

async function updateIdentity(
    id: number,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(identitiesTable).where({ id }).update(updatedValues);
}

async function getIdentitiesForWallet(walletId: number): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable).where({ walletId });
}

async function removeIdentity(id: number) {
    return (await knex())(identitiesTable).where({ id }).del();
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.identity.insert,
        async (_event, identity: Identity) => {
            return insertIdentity(identity);
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.update,
        async (_event, id: number, updatedValues: Record<string, unknown>) => {
            return updateIdentity(id, updatedValues);
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.getIdentitiesForWallet,
        async (_event, walletId: number) => {
            return getIdentitiesForWallet(walletId);
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.remove,
        async (_event, id: number) => {
            return removeIdentity(id);
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.getNextIdentityNumber,
        async (_event, walletId: number) => {
            return getNextIdentityNumber(walletId);
        }
    );
}
