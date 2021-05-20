import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
// eslint-disable-next-line import/no-cycle
import {
    initializeGenesisCredential,
    updateCredentialsStatus,
} from './CredentialSlice';
// eslint-disable-next-line import/no-cycle
import { addToAddressBook } from './AddressBookSlice';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    removeAccount as removeAccountFromDatabase,
    updateSignatureThreshold as updateSignatureThresholdInDatabase,
    confirmInitialAccount as confirmInitialAccountInDatabase,
    removeInitialAccount as removeInitialAccountInDatabase,
    findAccounts,
} from '../database/AccountDao';
import { getCredentialsOfAccount } from '~/database/CredentialDao';
import {
    decryptAmounts,
    getAddressFromCredentialId,
} from '../utils/rustInterface';
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

import { getAccountInfos, getAccountInfoOfAddress } from '../utils/nodeHelpers';

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
        updateAccountInfoEntry: (state, update) => {
            const { address, accountInfo } = update.payload;
            state.accountsInfo[address] = accountInfo;
        },
        updateAccountFields: (state, update) => {
            const { address, updatedFields } = update.payload;
            const index = state.accounts.findIndex(
                (account) => account.address === address
            );
            if (index > -1) {
                state.accounts[index] = {
                    ...state.accounts[index],
                    ...updatedFields,
                };
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
    updateAccountInfoEntry,
    updateAccountFields,
} = accountsSlice.actions;

// Load accounts into state, and updates their infos
export async function loadAccounts(dispatch: Dispatch) {
    const accounts: Account[] = await getAllAccounts();
    dispatch(updateAccounts(accounts.reverse()));
    return accounts;
}

// given an account and the accountEncryptedAmount from the accountInfo
// determine whether the account has received or sent new funds,
// and in that case return the the state of the account that should be updated to reflect that.
function updateAccountEncryptedAmount(
    account: Account,
    accountEncryptedAmount: AccountEncryptedAmount
): Partial<Account> {
    const { incomingAmounts } = accountEncryptedAmount;
    const selfAmounts = accountEncryptedAmount.selfAmount;
    const incomingAmountsString = JSON.stringify(incomingAmounts);
    if (
        !(
            account.incomingAmounts === incomingAmountsString &&
            account.selfAmounts === selfAmounts
        )
    ) {
        return {
            incomingAmounts: incomingAmountsString,
            selfAmounts,
            allDecrypted: false,
        };
    }
    return {};
}

export async function removeAccount(
    dispatch: Dispatch,
    accountAddress: string
) {
    await removeAccountFromDatabase(accountAddress);
    return loadAccounts(dispatch);
}

/** Generates the actual address of the account, and updates the account address, status, signatureThreshold,
 *   and the associated credentials' address and credentialIndex
 *  Also adds the account to the address book.
 *  N.B. A Genesis account's does not know its actual address, and account.address is a placeholder (a credId), and therefore we have to update it here.
 *  @return, returns the generated address.
 * */
async function initializeGenesisAccount(
    dispatch: Dispatch,
    account: Account,
    accountInfo: AccountInfo
) {
    const localCredentials = await getCredentialsOfAccount(account.address);
    const firstCredential = accountInfo.accountCredentials[0].value.contents;
    const address = await getAddressFromCredentialId(
        firstCredential.regId || firstCredential.credId
    );
    const accountUpdate = {
        address,
        status: AccountStatus.Confirmed,
        signatureThreshold: accountInfo.accountThreshold,
    };
    if ((await findAccounts({ address })).length > 0) {
        // The account already exists, so we should merge with it.
        removeAccount(dispatch, account.address); // Remove this instance of the account, which still has the credId as placeholder for the address.
    } else {
        // The account does not already exists, so we can update the current entry.
        await updateAccount(account.address, accountUpdate);
        await dispatch(
            updateAccountFields({
                address: account.address,
                updatedFields: accountUpdate,
            })
        );
        await addToAddressBook(dispatch, {
            name: account.name,
            address,
            readOnly: true,
        });
    }

    await Promise.all(
        localCredentials.map((cred) =>
            initializeGenesisCredential(dispatch, address, cred, accountInfo)
        )
    ).catch((e) => {
        throw e;
    });
    return address;
}

export async function updateSignatureThreshold(
    dispatch: Dispatch,
    address: string,
    signatureThreshold: number
) {
    updateSignatureThresholdInDatabase(address, signatureThreshold);
    return dispatch(
        updateAccountFields({ address, updatedFields: signatureThreshold })
    );
}

async function updateAccountFromAccountInfo(
    dispatch: Dispatch,
    account: Account,
    accountInfo: AccountInfo
) {
    let accountUpdate: Partial<Account> = {};
    if (
        accountInfo.accountThreshold &&
        account.signatureThreshold !== accountInfo.accountThreshold
    ) {
        accountUpdate.signatureThreshold = accountInfo.accountThreshold;
    }

    const encryptedAmountsUpdate = updateAccountEncryptedAmount(
        account,
        accountInfo.accountEncryptedAmount
    );

    accountUpdate = { ...encryptedAmountsUpdate, ...accountUpdate };

    if (Object.keys(accountUpdate).length > 0) {
        await updateAccount(account.address, accountUpdate);
        await dispatch(
            updateAccountFields({
                address: account.address,
                updatedFields: accountUpdate,
            })
        );
    }

    return updateCredentialsStatus(dispatch, account.address, accountInfo);
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
            (isValidAddress(account.address) &&
                account.status === AccountStatus.Confirmed) ||
            AccountStatus.Genesis === account.status // We don't check that the address is valid for genesis account, because they have a credId as placeholder. The lookup for accountInfo will still suceed, because the node will, given an invalid address, interpret it as a credId, and return the associated accounts's info. // TODO Remove this.
    );
    if (confirmedAccounts.length === 0) {
        return Promise.resolve();
    }
    const accountInfos = await getAccountInfos(confirmedAccounts);
    for (let i = 0; i < accountInfos.length; i += 1) {
        const { account, accountInfo } = accountInfos[i];
        if (account.status === AccountStatus.Genesis) {
            if (!accountInfo) {
                throw new Error(
                    `Genesis Account '${account.name}' not found on chain. Associated credId: ${account.address}` // account.address contains the placeholder credId
                );
            }
            // eslint-disable-next-line no-await-in-loop
            const address = await initializeGenesisAccount(
                dispatch,
                account,
                accountInfo
            );
            map[address] = accountInfo;
        } else {
            map[account.address] = accountInfo;
            // eslint-disable-next-line no-await-in-loop
            await updateAccountFromAccountInfo(dispatch, account, accountInfo);
        }
    }
    return dispatch(setAccountInfos(map));
}

/**
 * Updates the account info, of the account with the given address, in the state.
 */
export async function updateAccountInfoOfAddress(
    address: string,
    dispatch: Dispatch
) {
    const accountInfo = await getAccountInfoOfAddress(address);
    return dispatch(updateAccountInfoEntry({ address, accountInfo }));
}

/**
 * Updates the given account's accountInfo, in the state, and check if there is updates to the account.
 */
export async function updateAccountInfo(account: Account, dispatch: Dispatch) {
    const accountInfo = await getAccountInfoOfAddress(account.address);
    if (accountInfo && account.status === AccountStatus.Confirmed) {
        await updateAccountFromAccountInfo(dispatch, account, accountInfo);
        return dispatch(
            updateAccountInfoEntry({ address: account.address, accountInfo })
        );
    }
    return Promise.resolve();
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
    identityId: number,
    accountAddress: string
) {
    await confirmInitialAccountInDatabase(identityId, {
        status: AccountStatus.Confirmed,
        address: accountAddress,
    });
    return loadAccounts(dispatch);
}

export async function removeInitialAccount(
    dispatch: Dispatch,
    identityId: number
) {
    await removeInitialAccountInDatabase(identityId);
    return loadAccounts(dispatch);
}

// Attempts to confirm account by checking the status of the given transaction
// (Which is assumed to be of the credentialdeployment)
export async function confirmAccount(
    dispatch: Dispatch,
    address: string,
    transactionId: string
) {
    const response = await getStatus(transactionId);
    switch (response.status) {
        case TransactionStatus.Rejected:
            await updateAccount(address, {
                status: AccountStatus.Rejected,
            });
            break;
        case TransactionStatus.Finalized:
            await updateAccount(address, {
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

    return updateAccount(account.address, {
        totalDecrypted,
        allDecrypted: true,
    });
}

// Add an account with pending status.
export async function addExternalAccount(
    dispatch: Dispatch,
    accountAddress: string,
    accountName: string,
    identityId: number,
    signatureThreshold: number
) {
    const account: Account = {
        name: accountName,
        identityId,
        status: AccountStatus.Confirmed,
        address: accountAddress,
        signatureThreshold,
        maxTransactionId: 0,
        isInitial: false,
    };
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function importAccount(account: Account | Account[]) {
    await insertAccount(account);
}

export default accountsSlice.reducer;
