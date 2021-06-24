/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import { identitiesTable } from '~/constants/databaseNames.json';
import ipcCommands from '~/constants/ipcCommands.json';
import { Identity } from '~/utils/types';
import { removeInitialAccount } from './accountDao';

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

async function removeIdentity(id: number, trx: Knex.Transaction) {
    const table = (await knex())(identitiesTable).transacting(trx);
    return table.where({ id }).del();
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
        ipcCommands.database.identity.removeIdentityAndInitialAccount,
        async (_event, identityId: number) => {
            const db = await knex();
            await db.transaction((trx) => {
                removeInitialAccount(identityId, trx)
                    .then(() => {
                        return removeIdentity(identityId, trx);
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            });
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.getNextIdentityNumber,
        async (_event, walletId: number) => {
            return getNextIdentityNumber(walletId);
        }
    );
}
