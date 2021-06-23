/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { knex } from '~/database/knex';
import { addressBookTable } from '~/constants/databaseNames.json';
import { AddressBookEntry } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

function sanitizeAddressBookEntry(e: AddressBookEntry): AddressBookEntry {
    return { ...e, readOnly: Boolean(e.readOnly) };
}

async function getAddressBook(): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(addressBookTable)
        .orderByRaw('name COLLATE NOCASE ASC')
        .then((e) => e.map(sanitizeAddressBookEntry));
}

async function insertEntry(entry: AddressBookEntry | AddressBookEntry[]) {
    return (await knex())(addressBookTable).insert(entry);
}

async function updateEntry(
    address: string,
    updatedValues: Partial<AddressBookEntry>
) {
    return (await knex())(addressBookTable)
        .where({ address })
        .update(updatedValues);
}

async function removeEntry(entry: Partial<AddressBookEntry>) {
    return (await knex())(addressBookTable).where(entry).del();
}

async function findEntries(
    condition: Partial<AddressBookEntry>
): Promise<AddressBookEntry[]> {
    return (await knex())
        .select()
        .table(addressBookTable)
        .where(condition)
        .then((e) => e.map(sanitizeAddressBookEntry));
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.addressBook.getAll, async (_event) => {
        return getAddressBook();
    });

    ipcMain.handle(
        ipcCommands.database.addressBook.insert,
        async (_event, entry: AddressBookEntry | AddressBookEntry[]) => {
            return insertEntry(entry);
        }
    );

    ipcMain.handle(
        ipcCommands.database.addressBook.update,
        async (
            _event,
            address: string,
            updatedValues: Partial<AddressBookEntry>
        ) => {
            return updateEntry(address, updatedValues);
        }
    );

    ipcMain.handle(
        ipcCommands.database.addressBook.remove,
        async (_event, entry: Partial<AddressBookEntry>) => {
            return removeEntry(entry);
        }
    );

    ipcMain.handle(
        ipcCommands.database.addressBook.findEntries,
        async (_event, condition: Partial<AddressBookEntry>) => {
            return findEntries(condition);
        }
    );
}
