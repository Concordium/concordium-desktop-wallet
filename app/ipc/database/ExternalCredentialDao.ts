import { IpcMain } from 'electron';
import { externalCredentialsTable } from '~/constants/databaseNames.json';
import { ExternalCredential } from '~/database/types';
import { knex } from '~/database/knex';
import ipcCommands from '~/constants/ipcCommands.json';
import { MakeOptional } from '~/utils/types';

async function upsertExternalCredential(
    credential: MakeOptional<ExternalCredential, 'note'>
) {
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credential)
        .onConflict('credId')
        .merge();
}

async function upsertMultipleExternalCredentials(
    credentials: MakeOptional<ExternalCredential, 'note'>[]
) {
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credentials)
        .onConflict('credId')
        .ignore();
}

async function deleteExternalCredentials(credIds: string[]) {
    return (await knex())
        .table(externalCredentialsTable)
        .whereIn('credId', credIds)
        .del();
}

async function getAllExternalCredentials(): Promise<ExternalCredential[]> {
    return (await knex()).table(externalCredentialsTable).select();
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.externalCredentials.upsertExternalCredential,
        async (
            _event,
            credential: MakeOptional<ExternalCredential, 'note'>
        ) => {
            return upsertExternalCredential(credential);
        }
    );

    ipcMain.handle(
        ipcCommands.database.externalCredentials
            .upsertMultipleExternalCredentials,
        async (_event, creds: MakeOptional<ExternalCredential, 'note'>[]) => {
            return upsertMultipleExternalCredentials(creds);
        }
    );

    ipcMain.handle(
        ipcCommands.database.externalCredentials.deleteExternalCredentials,
        async (_event, credIds: string[]) => {
            return deleteExternalCredentials(credIds);
        }
    );

    ipcMain.handle(
        ipcCommands.database.externalCredentials.getAllExternalCredentials,
        async () => {
            return getAllExternalCredentials();
        }
    );
}
