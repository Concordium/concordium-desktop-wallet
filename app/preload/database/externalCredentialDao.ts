import { externalCredentialsTable } from '~/constants/databaseNames.json';
import { ExternalCredential } from '~/database/types';
import { knex } from '~/database/knex';
import { MakeOptional } from '~/utils/types';
import { ExternalCredentialMethods } from '~/preload/preloadTypes';

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
    if (!credentials.length) {
        return;
    }

    // eslint-disable-next-line consistent-return
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credentials)
        .onConflict('credId')
        .ignore();
}

async function deleteExternalCredentials(credIds: string[]) {
    if (!credIds.length) {
        return;
    }

    // eslint-disable-next-line consistent-return
    return (await knex())
        .table(externalCredentialsTable)
        .whereIn('credId', credIds)
        .del();
}

async function getAllExternalCredentials(): Promise<ExternalCredential[]> {
    return (await knex()).table(externalCredentialsTable).select();
}

const exposedMethods: ExternalCredentialMethods = {
    upsertExternalCredential,
    upsertMultipleExternalCredentials,
    deleteExternalCredentials,
    getAllExternalCredentials,
};

export default exposedMethods;
