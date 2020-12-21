import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAddressBook,
    insertEntry,
    updateEntry,
    removeEntry,
} from '../database/AddressBookDao';

const addressBookSlice = createSlice({
    name: 'addressBook',
    initialState: {
        addressBook: [],
        chosenIndex: 0,
    },
    reducers: {
        updateAddressBook(state, addresses) {
            state.addressBook = addresses.payload;
        },
        chooseIndex(state, index) {
            state.chosenIndex = index.payload;
        },
    },
});

export const { chooseIndex, updateAddressBook } = addressBookSlice.actions;

export async function loadAddressBook(dispatch: Dispatch) {
    const addressBook = await getAddressBook();
    dispatch(updateAddressBook(addressBook));
}

export async function updateAddressBookEntry(dispatch, name, newEntry) {
    await updateEntry(name, newEntry);
    loadAddressBook(dispatch);
}

export async function addToAddressBook(dispatch, entry) {
    await insertEntry(entry);
    loadAddressBook(dispatch);
}

export async function removeFromAddressBook(dispatch, entry) {
    await removeEntry(entry);
    loadAddressBook(dispatch);
}

export const addressBookSelector = (state: RootState) =>
    state.addressBook.addressBook;
export const chosenIndexSelector = (state: RootState) =>
    state.addressBook.chosenIndex;

export default addressBookSlice.reducer;
