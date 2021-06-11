import { AddressBookEntry } from '../utils/types';

export function sanitizeAddressBookEntry(
    e: AddressBookEntry
): AddressBookEntry {
    return { ...e, readOnly: Boolean(e.readOnly) };
}

/**
 * Get all entries of the address book from the database, ordered
 * by their name.
 */
export async function getAddressBook(): Promise<AddressBookEntry[]> {
    return window.ipcRenderer.invoke('dbGetAddressBook');
}

export async function insertEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return window.ipcRenderer.invoke('dbInsertAddressBookEntry', entry);
}

export async function updateEntry(
    address: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return window.ipcRenderer.invoke(
        'dbUpdateAddressBookEntry',
        address,
        updatedValues
    );
}

export async function removeEntry(entry: Partial<AddressBookEntry>) {
    return window.ipcRenderer.invoke('dbRemoveAddressBookEntry', entry);
}

export async function findEntries(
    condition: Partial<AddressBookEntry>
): Promise<AddressBookEntry[]> {
    return window.ipcRenderer.invoke('dbFindAddressBookEntries', condition);
}
