import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    getAddressBook,
    insertEntry,
    updateEntry,
    removeEntry,
} from '../database/AddressBookDao';
import { AccountStatus, AddressBookEntry, Dispatch } from '../utils/types';

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
    name: string,
    newEntry: AddressBookEntry
) {
    await updateEntry(name, newEntry);
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

export const addressBookConfirmedSelector = (state: RootState) => {
    const { accounts, addressBook } = state;

    return addressBook.addressBook.filter((e) =>
        [AccountStatus.Confirmed, AccountStatus.Genesis].includes(
            accounts.accounts.find((a) => a.address === e.address)?.status ??
                AccountStatus.Confirmed
        )
    );
};

export default addressBookSlice.reducer;
