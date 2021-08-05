import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    getAddressBook,
    insertEntry,
    updateEntry,
    removeEntry,
} from '../database/AddressBookDao';
import { AddressBookEntry, Dispatch } from '../utils/types';

interface AddressBookState {
    addressBook: AddressBookEntry[];
}

const initialState: AddressBookState = {
    addressBook: [],
};

const addressBookSlice = createSlice({
    name: 'addressBook',
    initialState,
    reducers: {
        updateAddressBook(state, addresses) {
            state.addressBook = addresses.payload;
        },
    },
});

export const { updateAddressBook } = addressBookSlice.actions;

export async function loadAddressBook(dispatch: Dispatch) {
    const addressBook = await getAddressBook();
    dispatch(updateAddressBook(addressBook));
}

export async function updateAddressBookEntry(
    dispatch: Dispatch,
    address: string,
    newEntry: Partial<AddressBookEntry>
) {
    await updateEntry(address, newEntry);
    loadAddressBook(dispatch);
}

export async function addToAddressBook(
    dispatch: Dispatch,
    entry: AddressBookEntry
) {
    await insertEntry(entry);
    loadAddressBook(dispatch);
}

export async function removeFromAddressBook(
    dispatch: Dispatch,
    entry: Partial<AddressBookEntry>
) {
    await removeEntry(entry);
    loadAddressBook(dispatch);
}

export async function importAddressBookEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return insertEntry(entry);
}

export const addressBookSelector = (state: RootState) =>
    state.addressBook.addressBook;

export default addressBookSlice.reducer;
