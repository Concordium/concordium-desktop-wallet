import { MakeOptional } from '~/utils/types';
import { externalCredentialsTable } from '~/constants/databaseNames.json';
import { ExternalCredential } from './types';
import { knex } from './knex';

// eslint-disable-next-line import/prefer-default-export
export async function upsert(
    credential: MakeOptional<ExternalCredential, 'note'>
) {
    return (await knex())
        .table(externalCredentialsTable)
        .insert(credential)
        .onConflict('credId')
        .merge();
}

export async function getAll(): Promise<ExternalCredential[]> {
    return (await knex()).table(externalCredentialsTable).select();
}
