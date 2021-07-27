import { Knex } from 'knex';
import { credentialsTable } from '~/constants/databaseNames.json';
import { Credential, CredentialStatus } from '~/utils/types';

type CredWithoutStatus = Omit<Credential, 'status'>;

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async (trx) => {
        await trx.schema.alterTable(credentialsTable, (table) => {
            table.string('status').notNullable();
        });

        const credentials: CredWithoutStatus[] = await trx(
            credentialsTable
        ).select();

        for (const credential of credentials) {
            const status =
                credential.credentialIndex !== null
                    ? CredentialStatus.Deployed
                    : CredentialStatus.Offchain;
            await trx(credentialsTable)
                .where({ credId: credential.credId })
                .update({ status });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(credentialsTable, (table) => {
        table.dropColumn('status');
    });
}
