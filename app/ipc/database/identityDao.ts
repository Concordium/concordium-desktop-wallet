/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import {
    identitiesTable,
    accountsTable,
    credentialsTable,
    addressBookTable,
} from '~/constants/databaseNames.json';
import ipcCommands from '~/constants/ipcCommands.json';
import { removeInitialAccount } from './accountDao';
import {
    Account,
    AccountStatus,
    AddressBookEntry,
    Identity,
    IdentityStatus,
} from '~/utils/types';

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

/**
 * Transactionally sets an identity to 'Rejected' and deletes its corresponding
 * initial account.
 * @param identityId the identity to reject
 */
async function rejectIdentityAndInitialAccount(identityId: number) {
    (await knex()).transaction(async (trx) => {
        await trx(identitiesTable)
            .where({ id: identityId })
            .update({ status: IdentityStatus.Rejected });
        await trx(accountsTable)
            .where({ identityId, isInitial: 1 })
            .update({ status: AccountStatus.Rejected });
    });
}

/**
 * Transactionally inserts an identity and its initial account.
 * @returns the identityId of the inserted identity
 */
async function addPendingIdentityAndInitialAccount(
    identity: Partial<Identity>,
    initialAccount: Omit<Account, 'identityId'>
) {
    return (await knex()).transaction(async (trx) => {
        const identityId = (
            await trx.table(identitiesTable).insert(identity)
        )[0];
        const initialAccountWithIdentityId = {
            ...initialAccount,
            identityId,
        };
        await trx.table(accountsTable).insert(initialAccountWithIdentityId);
        return identityId;
    });
}

/**
 * Updates the database entries accordingly after an identity has been
 * confirmed to be created by an identity provider. This includes:
 * - Setting the identity status to 'confirmed'.
 * - Setting the corresponding initial account status to 'confirmed'.
 * - Inserts the corresponding credential into the database.
 * - Adds the initial account as an entry in the address book.
 * All of this happens transactionally.
 */
async function confirmIdentity(
    identityId: number,
    identityObjectJson: string,
    accountAddress: string,
    credential: Credential,
    addressBookEntry: AddressBookEntry
) {
    (await knex()).transaction(async (trx) => {
        await trx(identitiesTable).where({ id: identityId }).update({
            status: IdentityStatus.Confirmed,
            identityObject: identityObjectJson,
        });
        await trx(accountsTable)
            .where({ identityId, isInitial: 1 })
            .first()
            .update({
                status: AccountStatus.Confirmed,
                address: accountAddress,
            });
        await trx(credentialsTable).insert(credential);
        await trx(addressBookTable).insert(addressBookEntry);
    });
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

    ipcMain.handle(
        ipcCommands.database.identity.rejectIdentityAndInitialAccount,
        async (_event, identityId: number) => {
            return rejectIdentityAndInitialAccount(identityId);
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.confirmIdentity,
        async (
            _event,
            identityId: number,
            identityObjectJson: string,
            accountAddress: string,
            credential: Credential,
            addressBookEntry: AddressBookEntry
        ) => {
            return confirmIdentity(
                identityId,
                identityObjectJson,
                accountAddress,
                credential,
                addressBookEntry
            );
        }
    );

    ipcMain.handle(
        ipcCommands.database.identity.insertPendingIdentityAndInitialAccount,
        async (
            _event,
            identity: Partial<Identity>,
            initialAccount: Omit<Account, 'identityId'>
        ) => {
            return addPendingIdentityAndInitialAccount(
                identity,
                initialAccount
            );
        }
    );
}
