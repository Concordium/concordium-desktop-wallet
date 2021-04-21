import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    removeAccount as removeAccountFromDatabase,
    updateSignatureThreshold as updateSignatureThresholdInDatabase,
} from '../database/AccountDao';
import { decryptAmounts } from '../utils/rustInterface';
import {
    AccountStatus,
    TransactionStatus,
    AccountEncryptedAmount,
    Account,
    AccountInfo,
    Dispatch,
    Global,
    Identity,
} from '../utils/types';
import { getStatus } from '../utils/transactionHelpers';
import { isValidAddress } from '../utils/accountHelpers';
import { getAccountInfos } from '../utils/nodeHelpers';

interface AccountState {
    accounts: Account[];
    accountsInfo: Record<string, AccountInfo>;
    chosenAccount: Account | undefined;
    chosenAccountIndex: number;
}

const initialState: AccountState = {
    accounts: [],
    accountsInfo: {},
    chosenAccount: undefined,
    chosenAccountIndex: -1,
};

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
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
                    (acc: Account) => acc.address === chosenAccount.address
                );
                if (matchingAccounts.length === 1) {
                    [state.chosenAccount] = matchingAccounts;
                    state.chosenAccountIndex = input.payload.indexOf(
                        matchingAccounts[0]
                    );
                } else {
                    state.chosenAccount = undefined;
                    state.chosenAccountIndex = -1;
                }
            }
        },
        setAccountInfos: (state, map) => {
            state.accountsInfo = map.payload;
        },
        updateAccountFields: (state, update) => {
            const { address, ...fields } = update.payload;
            const index = state.accounts.findIndex(
                (account) => account.address === address
            );
            if (index > -1) {
                state.accounts[index] = { ...state.accounts[index], ...fields };
            }
        },
    },
});

export const accountsSelector = (state: RootState) => state.accounts.accounts;

export const accountsOfIdentitySelector = (identity: Identity) => (
    state: RootState
) =>
    state.accounts.accounts.filter(
        (account) => account.identityId === identity.id
    );

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
    updateAccountFields,
} = accountsSlice.actions;

// given an account and the accountEncryptedAmount from the accountInfo
// determine whether the account has received or sent new funds,
// and in that case update the state of the account to reflect that.
function updateAccountEncryptedAmount(
    account: Account,
    accountEncryptedAmount: AccountEncryptedAmount
): Promise<void | number> {
    const { incomingAmounts } = accountEncryptedAmount;
    const selfAmounts = accountEncryptedAmount.selfAmount;
    const incomingAmountsString = JSON.stringify(incomingAmounts);
    if (
        !(
            account.incomingAmounts === incomingAmountsString &&
            account.selfAmounts === selfAmounts
        )
    ) {
        return updateAccount(account.name, {
            incomingAmounts: incomingAmountsString,
            selfAmounts,
            allDecrypted: false,
        });
    }
    return Promise.resolve();
}

// Loads the given accounts' infos from the node, then updates the
// AccountInfo state.
export async function loadAccountInfos(
    accounts: Account[],
    dispatch: Dispatch
) {
    const map: Record<string, AccountInfo> = {};
    const confirmedAccounts = accounts.filter(
        (account) =>
            isValidAddress(account.address) &&
            account.status === AccountStatus.Confirmed
    );
    if (confirmedAccounts.length === 0) {
        return Promise.resolve();
    }
    const accountInfos = await getAccountInfos(confirmedAccounts);
    const updateEncryptedAmountsPromises = accountInfos.map(
        ({ account, accountInfo }) => {
            map[account.address] = accountInfo;
            return updateAccountEncryptedAmount(
                account,
                accountInfo.accountEncryptedAmount
            );
        }
    );
    await Promise.all(updateEncryptedAmountsPromises);
    return dispatch(setAccountInfos(map));
}

// Load accounts into state, and updates their infos
export async function loadAccounts(dispatch: Dispatch) {
    const accounts: Account[] = await getAllAccounts();
    dispatch(updateAccounts(accounts.reverse()));
    return accounts;
}

// Add an account with pending status..
export async function addPendingAccount(
    dispatch: Dispatch,
    accountName: string,
    identityId: number,
    isInitial: boolean,
    accountAddress = '',
    deploymentTransactionId: string | undefined = undefined
) {
    const account: Account = {
        name: accountName,
        identityId,
        status: AccountStatus.Pending,
        address: accountAddress,
        signatureThreshold: 1,
        maxTransactionId: 0,
        isInitial,
        deploymentTransactionId,
    };
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmInitialAccount(
    dispatch: Dispatch,
    accountName: string,
    accountAddress: string
) {
    await updateAccount(accountName, {
        status: AccountStatus.Confirmed,
        address: accountAddress,
    });
    return loadAccounts(dispatch);
}

// Attempts to confirm account by checking the status of the given transaction
// (Which is assumed to be of the credentialdeployment)
export async function confirmAccount(
    dispatch: Dispatch,
    accountName: string,
    transactionId: string
) {
    const response = await getStatus(transactionId);
    switch (response.status) {
        case TransactionStatus.Rejected:
            await updateAccount(accountName, {
                status: AccountStatus.Rejected,
            });
            break;
        case TransactionStatus.Finalized:
            await updateAccount(accountName, {
                status: AccountStatus.Confirmed,
            });
            break;
        default:
            throw new Error('Unexpected status was returned by the poller!');
    }
    return loadAccounts(dispatch);
}

// Decrypts the shielded account balance of the given account, using the prfKey.
// This function expects the prfKey to match the account's prfKey.
export async function decryptAccountBalance(
    prfKey: string,
    account: Account,
    credentialNumber: number,
    global: Global
) {
    if (!account.incomingAmounts) {
        throw new Error('Unexpected missing field!');
    }
    const encryptedAmounts = JSON.parse(account.incomingAmounts);
    encryptedAmounts.push(account.selfAmounts);

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        credentialNumber,
        global,
        prfKey
    );

    const totalDecrypted = decryptedAmounts
        .reduce((acc, amount) => acc + BigInt(amount), 0n)
        .toString();

    return updateAccount(account.name, {
        totalDecrypted,
        allDecrypted: true,
    });
}

export async function importAccount(account: Account | Account[]) {
    await insertAccount(account);
}

export async function removeAccount(
    dispatch: Dispatch,
    accountAddress: string
) {
    await removeAccountFromDatabase(accountAddress);
    return loadAccounts(dispatch);
}

export async function updateSignatureThreshold(
    dispatch: Dispatch,
    address: string,
    signatureThreshold: number
) {
    updateSignatureThresholdInDatabase(address, signatureThreshold);
    return dispatch(updateAccountFields({ address, signatureThreshold }));
}

export default accountsSlice.reducer;
