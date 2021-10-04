import { AddressBookEntry } from './types';
import { findEntries } from '~/database/AddressBookDao';

export async function lookupAddressBookEntry(
    address: string
): Promise<AddressBookEntry | undefined> {
    const entries = await findEntries({ address });
    return entries[0];
}

/**
 * Attempts to find the address in the AddressBook.
 * If the address is found, return the name, otherwise returns undefined;
 */
export async function lookupName(address: string): Promise<string | undefined> {
    return (await lookupAddressBookEntry(address))?.name;
}
