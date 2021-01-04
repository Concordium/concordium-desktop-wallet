import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    getAccountsOfIdentity,
} from '../database/AccountDao';
import { getTransactionStatus } from '../utils/client';
import { sleep } from '../utils/httpRequests';

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
            state.chosenAccount = state.accounts[input.payload];
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
    accountNumber: number,
    accountAddress: string,
    credentialDeploymentInformation
) {
    const account = {
        name: accountName,
        identityName,
        status: 'pending',
        accountNumber,
        address: accountAddress,
        credential: credentialDeploymentInformation,
        // initial
    };

    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmAccount(dispatch, accountName, transactionId) {
    while (true) {
        const response = await getTransactionStatus(transactionId);
        const data = response.getValue();
        console.log(data);
        if (data === 'null') {
            await updateAccount(accountName, {
                status: 'rejected',
            });
            return loadAccounts(dispatch);
        }
        const dataObject = JSON.parse(data);
        const { status } = dataObject;
        if (status === 'finalized') {
            await updateAccount(accountName, {
                status: 'confirmed',
                credential: dataObject.credential,
            });
            return loadAccounts(dispatch);
        }

        await sleep(10000);
    }
}

export async function getNextAccountNumber(identityName) {
    const accounts: Account[] = await getAccountsOfIdentity(identityName);
    const currentNumber = accounts.reduce(
        (num, acc) => Math.max(num, acc.accountNumber),
        0
    );
    return currentNumber + 1;
}

export default accountsSlice.reducer;
