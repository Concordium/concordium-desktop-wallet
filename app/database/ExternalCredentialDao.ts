import { MakeOptional } from '~/utils/types';
import { externalCredentialsTable } from '~/constants/databaseNames.json';
import { ExternalCredential } from './types';
import { knex } from './knex';

type ExternalCredentialOptionalNote = MakeOptional<ExternalCredential, 'note'>;

// eslint-disable-next-line import/prefer-default-export
export async function upsertExternalCredential(
    credential: ExternalCredentialOptionalNote
) {
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credential)
        .onConflict('credId')
        .merge();
}

export async function upsertMultipleExternalCredentials(
    credentials: ExternalCredentialOptionalNote[]
) {
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credentials)
        .onConflict('credId')
        .ignore();
}

export async function deleteExternalCredentials(credIds: string[]) {
    return (await knex())
        .table(externalCredentialsTable)
        .whereIn('credId', credIds)
        .del();
}

export async function getAllExternalCredentials(): Promise<
    ExternalCredential[]
> {
    return (await knex()).table(externalCredentialsTable).select();
}
