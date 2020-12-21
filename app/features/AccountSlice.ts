import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
} from '../database/AccountDao';

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        accounts: undefined,
        chosenAccount: undefined,
        chosenAccountIndex: undefined,
    },
    reducers: {
        chooseAccount: (state, input) => {
            state.chosenAccountIndex = input.payload;
            state.chosenAccount = state.chosenIdentity.accounts[input.payload];
        },
        updateAccounts: (state, input) => {
            state.accounts = input.payload;
        },
    },
});

export const accountsSelector = (state: RootState) => state.accounts.accounts;

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.chosenAccount;

export const chosenAccountIndexSelector = (state: RootState) =>
    state.accounts.chosenAccountIndex;

export const { chooseAccount, updateAccounts } = accountsSlice.actions;

export async function loadAccounts(dispatch: Dispatch) {
    const accounts: Account[] = await getAllAccounts();
    dispatch(updateAccounts(accounts));
}

export async function addPendingAccount(
    dispatch: Dispatch,
    accountName: string,
    identityName: string,
    accountNumber: number
) {
    const account = {
        name: accountName,
        identityName,
        status: 'pending',
        accountNumber,
        // initial
    };

    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmAccount(
    dispatch: Dispatch,
    accountName: string,
    accountAddress: string,
    credential
) {
    await updateAccount(identityName, {
        status: 'confirmed',
        credential,
        address: accountAddress,
    });
    return loadAccounts(dispatch);
}

export default accountsSlice.reducer;
