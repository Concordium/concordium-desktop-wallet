import { createSlice } from '@reduxjs/toolkit';
import bs58check from 'bs58check';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    getAccountsOfIdentity,
} from '../database/AccountDao';
import { getAccountInfo, getConsensusInfo } from '../utils/client';
import { getGlobal } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import { CredentialDeploymentInformation, AccountStatus } from '../utils/types';
import { waitForFinalization } from '../utils/transactionHelpers';

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
            const { chosenAccount } = state;
            state.accounts = input.payload;
            if (chosenAccount) {
                const matchingAccounts = input.payload.filter(
                    (acc) => acc.address === chosenAccount.address
                );
                if (matchingAccounts.length === 1) {
                    [state.chosenAccount] = matchingAccounts;
                    state.chosenAccountIndex = input.payload.indexOf(
                        matchingAccounts[0]
                    );
                } else {
                    state.chosenAccount = undefined;
                    state.chosenAccountIndex = undefined;
                }
            }
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

export const chosenAccountInfoSelector = (state: RootState) =>
    state.accounts.accountsInfo && state.accounts.chosenAccount
        ? state.accounts.accountsInfo[state.accounts.chosenAccount.address]
        : undefined;

export const chosenAccountIndexSelector = (state: RootState) =>
    state.accounts.chosenAccountIndex;

export const {
    chooseAccount,
    updateAccounts,
    setAccountInfos,
} = accountsSlice.actions;

// Given a string, checks if it is a valid bs58check address.
// TODO: check length?
function isValidAddress(address: string): boolean {
    try {
        if (!address) {
            return false;
        }
        bs58check.decode(address); // This function should an error if invalid checksum
    } catch (e) {
        return false;
    }
    return true;
}

// Loads the given accounts' infos from the node, then updates the
// AccountInfo state.
export async function loadAccountsInfos(accounts, dispatch) {
    const map = {};
    const consenusInfo = JSON.parse((await getConsensusInfo()).getValue());
    const blockHash = consenusInfo.lastFinalizedBlock;
    await Promise.all(
        accounts
            .filter(
                (account) =>
                    isValidAddress(account.address) &&
                    account.status === AccountStatus.Confirmed
            )
            .map(async (account) => {
                const response = await getAccountInfo(
                    account.address,
                    blockHash
                );
                const accountInfo = JSON.parse(response.getValue());
                const incomingAmounts = JSON.stringify(
                    accountInfo.accountEncryptedAmount.incomingAmounts
                );
                const selfAmounts =
                    accountInfo.accountEncryptedAmount.selfAmount;
                if (
                    !(
                        account.incomingAmounts === incomingAmounts &&
                        account.selfAmounts === selfAmounts
                    )
                ) {
                    await updateAccount(account.name, {
                        incomingAmounts,
                        selfAmounts,
                        allDecrypted: false,
                    });
                }
                map[account.address] = accountInfo;
            })
    );
    return dispatch(setAccountInfos(map));
}

// Load accounts into state, and updates their infos
export async function loadAccounts(dispatch: Dispatch) {
    const accounts: Account[] = await getAllAccounts();
    await loadAccountsInfos(accounts, dispatch);
    dispatch(updateAccounts(accounts.reverse()));
    return true;
}

// Add an account with pending status..
export async function addPendingAccount(
    dispatch: Dispatch,
    accountName: string,
    identityId: number,
    accountNumber: number,
    accountAddress: string,
    credentialDeploymentInfo: CredentialDeploymentInformation
) {
    const account: Account = {
        name: accountName,
        identityId,
        status: AccountStatus.Pending,
        accountNumber,
        address: accountAddress,
        credential: JSON.stringify(credentialDeploymentInfo),
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
        status: AccountStatus.Confirmed,
        address: accountAddress,
        credential,
    });
    return loadAccounts(dispatch);
}

// Attempts to confirm account by checking the status of the given transaction
// (Which is assumed to be of the credentialdeployment)
export async function confirmAccount(dispatch, accountName, transactionId) {
    const finalized = await waitForFinalization(transactionId);
    if (finalized !== undefined) {
        await updateAccount(accountName, {
            status: AccountStatus.Confirmed,
        });
    } else {
        await updateAccount(accountName, {
            status: AccountStatus.Rejected,
        });
    }
    return loadAccounts(dispatch);
}

// Get The next unused account number of the identity with the given ID
export async function getNextAccountNumber(identityId) {
    const accounts: Account[] = await getAccountsOfIdentity(identityId);
    const currentNumber = accounts.reduce(
        (num, acc) => Math.max(num, acc.accountNumber),
        0
    );
    return currentNumber + 1;
}

// Decrypts the shielded account balance of the given account, using the prfKey.
// This function expects the prfKey to match the account's prfKey.
export async function decryptAccountBalance(dispatch, prfKey, account) {
    const encryptedAmounts = JSON.parse(account.incomingAmounts);
    encryptedAmounts.push(account.selfAmounts);
    const global = (await getGlobal()).value;

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        account,
        global,
        prfKey
    );

    const totalDecrypted = decryptedAmounts.reduce(
        (acc, amount) => acc + parseInt(amount, 10),
        0
    );

    return updateAccount(account.name, {
        totalDecrypted,
        allDecrypted: true,
    });
}

export default accountsSlice.reducer;
