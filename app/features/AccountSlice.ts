import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    getAccountsOfIdentity,
} from '../database/AccountDao';
import { getGlobal } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    CredentialDeploymentInformation,
    AccountStatus,
    AccountEncryptedAmount,
    Account,
    AccountInfo,
    Dispatch,
} from '../utils/types';
import { waitForFinalization } from '../utils/transactionHelpers';
import { isValidAddress } from '../utils/accountHelpers';
import { getAccountInfos } from '../utils/clientHelpers';

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

// given an account and the accountEncryptedAmount from the accountInfo
// determine whether the account has received or sent new funds,
// and in that case update the state of the account to reflect that.
function updateAccountEncryptedAmount(
    account: Account,
    accountEncryptedAmount: AccountEncryptedAmount
): Promise<void> {
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
    await loadAccountInfos(accounts, dispatch);
    dispatch(updateAccounts(accounts.reverse()));
}

// Add an account with pending status..
export async function addPendingAccount(
    dispatch: Dispatch,
    accountName: string,
    identityId: number,
    accountNumber: number,
    accountAddress = '',
    credentialDeploymentInfo:
        | CredentialDeploymentInformation
        | undefined = undefined,
    credentialDeploymentId = ''
) {
    const account: Account = {
        name: accountName,
        identityId,
        status: AccountStatus.Pending,
        accountNumber,
        address: accountAddress,
        credential: JSON.stringify(credentialDeploymentInfo),
        credentialDeploymentId,
    };
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmInitialAccount(
    dispatch: Dispatch,
    accountName: string,
    accountAddress: string,
    credential: CredentialDeploymentInformation
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
export async function confirmAccount(
    dispatch: Dispatch,
    accountName: string,
    transactionId: string
) {
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
export async function getNextAccountNumber(identityId: number) {
    const accounts: Account[] = await getAccountsOfIdentity(identityId);
    const currentNumber = accounts.reduce(
        (num, acc) => Math.max(num, acc.accountNumber),
        0
    );
    return currentNumber + 1;
}

// Decrypts the shielded account balance of the given account, using the prfKey.
// This function expects the prfKey to match the account's prfKey.
export async function decryptAccountBalance(prfKey: string, account: Account) {
    if (!account.incomingAmounts) {
        throw new Error('Unexpected missing field!');
    }
    const encryptedAmounts = JSON.parse(account.incomingAmounts);
    encryptedAmounts.push(account.selfAmounts);
    const global = await getGlobal();

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        account,
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

export default accountsSlice.reducer;
