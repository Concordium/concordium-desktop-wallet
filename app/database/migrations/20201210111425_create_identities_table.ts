import * as Knex from 'knex';
import {
    hwWalletTable,
    identitiesTable,
} from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        identitiesTable,
        (table: Knex.TableBuilder) => {
            table.integer('id');
            table.string('name');
            table.string('status');
            table.string('detail');
            table.string('codeUri');
            table.string('identityProvider');
            table.string('identityObject');
            table.string('randomness');
            table
                .string('hwWallet')
                .references('identifier')
                .inTable(hwWalletTable)
                .notNullable();
            table.primary(['id', 'hwWallet']);
            table.unique(['id', 'hwWallet']);
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(identitiesTable);
}
