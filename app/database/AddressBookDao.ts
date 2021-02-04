import { AddressBookEntry } from '../utils/types';
import knex from './knex';
import { addressBookTable } from '../constants/databaseNames.json';

export async function getAddressBook(): Promise<AddressBookEntry[]> {
    return (await knex()).select().table(addressBookTable);
}

export async function insertEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return (await knex())(addressBookTable).insert(entry);
}

export async function updateEntry(
    name: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return (await knex())(addressBookTable)
        .where({ name })
        .update(updatedValues);
}

export async function removeEntry(entry: AddressBookEntry) {
    return (await knex())(addressBookTable).where(entry).del();
}

export async function findEntries(condition: Partial<AddressBookEntry>) {
    return (await knex()).select().table(addressBookTable).where(condition);
}
