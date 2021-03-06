/* eslint-disable @typescript-eslint/no-explicit-any */
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import { AddressBookEntry } from '~/utils/types';
import { AddressBookMethods } from '~/preload/preloadTypes';

function sanitizeAddressBookEntry(e: AddressBookEntry): AddressBookEntry {
    return { ...e, readOnly: Boolean(e.readOnly) };
}

/**
 * Get all entries of the address book from the database, ordered
 * by their name.
 */
async function getAddressBook(): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(databaseNames.addressBookTable)
        .orderByRaw('name COLLATE NOCASE ASC')
        .then((e) => e.map(sanitizeAddressBookEntry));
}

async function insertEntry(entry: AddressBookEntry | AddressBookEntry[]) {
    return (await knex())(databaseNames.addressBookTable).insert(entry);
}

async function updateEntry(
    address: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return (await knex())(databaseNames.addressBookTable)
        .where({ address })
        .update(updatedValues);
}

async function removeEntry(entry: Partial<AddressBookEntry>) {
    return (await knex())(databaseNames.addressBookTable).where(entry).del();
}

async function findEntries(
    condition: Partial<AddressBookEntry>
): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(databaseNames.addressBookTable)
        .where(condition)
        .then((e) => e.map(sanitizeAddressBookEntry));
}

export async function getEntryName(address: string) {
    const entry = await (await knex())
        .select<AddressBookEntry>('name')
        .table(databaseNames.addressBookTable)
        .where({ address })
        .first();
    if (entry) {
        return entry.name;
    }
    return undefined;
}

const exposedMethods: AddressBookMethods = {
    getAll: getAddressBook,
    insert: insertEntry,
    update: updateEntry,
    remove: removeEntry,
    findEntries,
};
export default exposedMethods;
