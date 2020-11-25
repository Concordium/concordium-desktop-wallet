import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import * as storage from '../utils/persistentStorage.ts';

const storageKey = 'addressbook';

const addressBookSlice = createSlice({
    name: 'addressBook',
    initialState: {
        addressBook: [],
        chosenIndex: 0,
    },
    reducers: {
        setAddressBook(state, addresses) {
            state.addressBook = addresses.payload;
        },
        saveAddressBook(state, addresses) {
            storage.save(storageKey, addresses.payload);
        },
        addToAddressBook(state, address) {
            // TODO validate address
            state.addressBook.push(address.payload);
            storage.save(storageKey, state.addressBook);
        },
        chooseIndex(state, index) {
            state.chosenIndex = index.payload;
        },
    },
});

export const {
    setAddressBook,
    saveAddressBook,
    addToAddressBook,
    chooseIndex,
} = addressBookSlice.actions;

export function loadAddressBook(dispatch) {
    storage
        .load(storageKey)
        .then((addresses) => dispatch(setAddressBook(addresses)))
        .catch(console.log);
}

export const addressBookSelector = (state: RootState) =>
    state.addressBook.addressBook;
export const chosenIndexSelector = (state: RootState) =>
    state.addressBook.chosenIndex;

export default addressBookSlice.reducer;
