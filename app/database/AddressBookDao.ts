import { AddressBookEntry } from '../utils/types';
import { knex } from './knex';
import { addressBookTable } from '../constants/databaseNames.json';

function sanitizeAddressBookEntry(e: AddressBookEntry): AddressBookEntry {
    return { ...e, readOnly: Boolean(e.readOnly) };
}

/**
 * Get all entries of the address book from the database, ordered
 * by their name.
 */
export async function getAddressBook(): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(addressBookTable)
        .orderByRaw('name COLLATE NOCASE ASC')
        .then((e) => e.map(sanitizeAddressBookEntry));
}

export async function insertEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return (await knex())(addressBookTable).insert(entry);
}

export async function updateEntry(
    address: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return (await knex())(addressBookTable)
        .where({ address })
        .update(updatedValues);
}

export async function removeEntry(entry: Partial<AddressBookEntry>) {
    return (await knex())(addressBookTable).where(entry).del();
}

export async function findEntries(
    condition: Partial<AddressBookEntry>
): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(addressBookTable)
        .where(condition)
        .then((e) => e.map(sanitizeAddressBookEntry));
}
