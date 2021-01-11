import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    getAccountsOfIdentity,
} from '../database/AccountDao';
import {
    getTransactionStatus,
    getAccountInfo,
    getConsensusInfo,
} from '../utils/client';
import { sleep } from '../utils/httpRequests';

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        accounts: undefined,
        accountsInfo: undefined,
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
        setAccountInfos: (state, map) => {
            state.accountsInfo = map.payload;
        },
    },
});

export const accountsSelector = (state: RootState) => state.accounts.accounts;

export const accountsInfoSelector = (state: RootState) =>
    state.accounts.accountsInfo;

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.chosenAccount;

export const chosenAccountIndexSelector = (state: RootState) =>
    state.accounts.chosenAccountIndex;

export const {
    chooseAccount,
    updateAccounts,
    setAccountInfos,
} = accountsSlice.actions;

export async function loadAccounts(dispatch: Dispatch, identities = undefined) {
    const accounts: Account[] = await getAllAccounts();
    if (identities) {
        await Promise.all(
            accounts.map(async (account) => {
                const matchingIds = identities.filter(
                    (identity) =>
                        identity.id === parseInt(account.identityId, 10)
                );
                if (matchingIds.length > 0) {
                    account.identityName = matchingIds[0].name;
                }
            })
        );
    }
    dispatch(updateAccounts(accounts));
}

export async function addPendingAccount(
    dispatch: Dispatch,
    accountName: string,
    identityId: number,
    accountNumber: number
) {
    const account = {
        name: accountName,
        identityId,
        status: 'pending',
        accountNumber,
    };
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmInitialAccount(
    dispatch,
    accountName,
    accountAddress,
    credential
) {
    await updateAccount(accountName, {
        status: 'confirmed',
        address: accountAddress,
        credential,
    });
    return loadAccounts(dispatch);
}

export async function confirmAccount(dispatch, accountName, transactionId) {
    while (true) {
        const response = await getTransactionStatus(transactionId);
        const data = response.getValue();
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
            });
            return loadAccounts(dispatch);
        }

        await sleep(10000);
    }
}

export async function getNextAccountNumber(identityId) {
    const accounts: Account[] = await getAccountsOfIdentity(identityId);
    const currentNumber = accounts.reduce(
        (num, acc) => Math.max(num, acc.accountNumber),
        0
    );
    return currentNumber + 1;
}

function isValidAddress(address): boolean {
    // TODO: Check length
    try {
        if (!address) {
            return false;
        }
        const regex = /[0-9A-Fa-f]{6}/g;
        regex.test(address);
    } catch (e) {
        return false;
    }
    return true;
}

export async function loadAccountsInfos(accounts, dispatch) {
    const map = {};
    const consenusInfo = JSON.parse((await getConsensusInfo()).getValue());
    const blockHash = consenusInfo.lastFinalizedBlock;
    await Promise.all(
        accounts
            .filter((account) => isValidAddress(account.address))
            .map(async (account) => {
                const response = await getAccountInfo(
                    account.address,
                    blockHash
                );
                map[account.address] = JSON.parse(response.getValue());
            })
    );
    dispatch(setAccountInfos(map));
}

export default accountsSlice.reducer;
