import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import getABDao from '../database/AddressBookDao';
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
    const addressBook = await getABDao().getAll();
    dispatch(updateAddressBook(addressBook));
}

export async function updateAddressBookEntry(
    dispatch: Dispatch,
    address: string,
    newEntry: Partial<AddressBookEntry>
) {
    await getABDao().update(address, newEntry);
    loadAddressBook(dispatch);
}

export async function addToAddressBook(
    dispatch: Dispatch,
    entry: AddressBookEntry
) {
    await getABDao().insert(entry);
    loadAddressBook(dispatch);
}

export async function removeFromAddressBook(
    dispatch: Dispatch,
    entry: Partial<AddressBookEntry>
) {
    await getABDao().remove(entry);
    loadAddressBook(dispatch);
}

export async function importAddressBookEntry(
    entry: AddressBookEntry | AddressBookEntry[]
) {
    return getABDao().insert(entry);
}

export const addressBookSelector = (state: RootState) =>
    state.addressBook.addressBook;

export default addressBookSlice.reducer;
