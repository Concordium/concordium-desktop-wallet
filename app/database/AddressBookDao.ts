import { AddressBookEntry } from '../utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

/**
 * Get all entries of the address book from the database, ordered
 * by their name.
 */
export async function getAddressBook(): Promise<AddressBookEntry[]> {
    return window.ipcRenderer.invoke(ipcCommands.database.addressBook.getAll);
}

export async function insertEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.addressBook.insert,
        entry
    );
}

export async function updateEntry(
    address: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.addressBook.update,
        address,
        updatedValues
    );
}

export async function removeEntry(entry: Partial<AddressBookEntry>) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.addressBook.remove,
        entry
    );
}

export async function findEntries(
    condition: Partial<AddressBookEntry>
): Promise<AddressBookEntry[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.addressBook.findEntries,
        condition
    );
}
