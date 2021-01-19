import { Account } from '../utils/types';
import knex from './knex';
import { addressBookTable } from '../constants/databaseNames.json';

export async function getAddressBook(): Promise<Account[]> {
    return (await knex()).select().table(addressBookTable);
}

export async function insertEntry(entry: Account) {
    return (await knex())(addressBookTable).insert(entry);
}

export async function updateEntry(name: string, updatedValues) {
    return (await knex())(addressBookTable)
        .where({ name })
        .update(updatedValues);
}

export async function removeEntry(entry: Account) {
    return (await knex())(addressBookTable).where(entry).del();
}
