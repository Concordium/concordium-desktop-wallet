import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
// eslint-disable-next-line import/no-cycle
import {
    initializeGenesisCredential,
    updateCredentialsStatus,
} from './CredentialSlice';
// eslint-disable-next-line import/no-cycle
import { addToAddressBook, updateAddressBookEntry } from './AddressBookSlice';
import {
    getAllAccounts,
    insertAccount,
    updateAccount,
    getAccount,
    updateInitialAccount,
    removeAccount as removeAccountFromDatabase,
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
    TransactionFilter,
    Hex,
} from '../utils/types';
import { createAccount, isValidAddress } from '../utils/accountHelpers';
import {
    getAccountInfos,
    getAccountInfoOfAddress,
    getStatus,
} from '../node/nodeHelpers';
import { hasPendingTransactions } from '~/database/TransactionDao';
import { accountSimpleView, defaultAccount } from '~/database/PreferencesDao';
import { toStringBigInts } from '~/utils/JSONHelper';
import { getCredId } from '~/utils/credentialHelper';

export interface AccountState {
    simpleView: boolean;
    accounts: Account[];
    accountsInfo: Record<string, AccountInfo>;
    chosenAccountAddress: string;
    defaultAccount: string | undefined;
}

type AccountByIndexTuple = [number, Account];

function getValidAccountsIndices(accounts: Account[]): AccountByIndexTuple[] {
    return accounts
        .reduce(
            (acc, cur, i) => [...acc, [i, cur]] as AccountByIndexTuple[],
            [] as AccountByIndexTuple[]
        )
        .filter(([, acc]) => acc.status === AccountStatus.Confirmed);
}

const setConfirmedAccount = (next: boolean) => (state: AccountState) => {
    const chosenIndex = state.accounts.findIndex(
        (a) => a.address === state.chosenAccountAddress
    );
    let confirmedAccountsIndices = getValidAccountsIndices(state.accounts);

    if (!next) {
        confirmedAccountsIndices = confirmedAccountsIndices.reverse();
    }

    const firstValid = next
        ? ([i]: AccountByIndexTuple) => i > chosenIndex
        : ([i]: AccountByIndexTuple) => i < chosenIndex;

    state.chosenAccountAddress =
        confirmedAccountsIndices.find(firstValid)?.[1].address ??
        confirmedAccountsIndices[0]?.[1].address ??
        state.chosenAccountAddress;
};

const initialState: AccountState = {
    simpleView: true,
    accounts: [],
    accountsInfo: {},
    chosenAccountAddress: '',
    defaultAccount: undefined,
};

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        simpleViewActive(state, input: PayloadAction<boolean>) {
            state.simpleView = input.payload;
        },
        nextConfirmedAccount: setConfirmedAccount(true),
        previousConfirmedAccount: setConfirmedAccount(false),
        chooseAccount: (state, input: PayloadAction<string>) => {
            state.chosenAccountAddress = input.payload;
        },
        updateAccounts: (state, input) => {
            state.accounts = input.payload;

            if (!state.chosenAccountAddress) {
                state.chosenAccountAddress =
                    state.defaultAccount || state.accounts[0]?.address || '';
            }
        },
        setAccountInfos: (state, map) => {
            state.accountsInfo = map.payload;
        },
        setDefaultAccount(state, input: PayloadAction<Hex | undefined>) {
            state.defaultAccount = input.payload;

            if (input.payload) {
                state.chosenAccountAddress = input.payload;
            }
        },
        addToAccountInfos: (state, map) => {
            state.accountsInfo = { ...state.accountsInfo, ...map.payload };
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

export const confirmedAccountsSelector = (state: RootState) =>
    state.accounts.accounts.filter(
        (account) => account.status === AccountStatus.Confirmed
    );

export const initialAccountNameSelector = (identityId: number) => (
    state: RootState
) =>
    state.accounts.accounts.find(
        (account) => account.identityId === identityId && account.isInitial
    )?.name;

export const accountsInfoSelector = (state: RootState) =>
    state.accounts.accountsInfo;

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.accounts.find(
        (a) => a.address === state.accounts.chosenAccountAddress
    );

export const chosenAccountInfoSelector = (
    state: RootState
): AccountInfo | undefined =>
    state.accounts.accountsInfo?.[chosenAccountSelector(state)?.address ?? ''];

export const accountInfoSelector = (account?: Account) => (state: RootState) =>
    state.accounts.accountsInfo?.[account?.address ?? ''];

export const defaultAccountSelector = (state: RootState) =>
    state.accounts.accounts.find(
        (a) => a.address === state.accounts.defaultAccount
    );

export const {
    chooseAccount,
    updateAccounts,
    setAccountInfos,
    updateAccountInfoEntry,
    updateAccountFields,
    nextConfirmedAccount,
    previousConfirmedAccount,
    addToAccountInfos,
} = accountsSlice.actions;

// Load accounts into state, and updates their infos
export async function loadAccounts(dispatch: Dispatch) {
    const accounts: Account[] = await getAllAccounts();
    dispatch(updateAccounts(accounts.reverse()));
    return accounts;
}

async function loadSimpleViewActive(dispatch: Dispatch) {
    const simpleViewActive = await accountSimpleView.get();
    dispatch(accountsSlice.actions.simpleViewActive(simpleViewActive ?? true));
}

async function loadDefaultAccount(dispatch: Dispatch) {
    dispatch(
        accountsSlice.actions.setDefaultAccount(
            (await defaultAccount.get()) ?? undefined
        )
    );
}

export function initAccounts(dispatch: Dispatch) {
    return Promise.all([
        loadAccounts(dispatch),
        loadSimpleViewActive(dispatch),
        loadDefaultAccount(dispatch),
    ]);
}

// given an account and the accountEncryptedAmount from the accountInfo
// determine whether the account has received or sent new funds,
// and in that case return the the state of the account that should be updated to reflect that.
async function updateAccountEncryptedAmount(
    account: Account,
    accountEncryptedAmount: AccountEncryptedAmount
): Promise<Partial<Account>> {
    const { incomingAmounts } = accountEncryptedAmount;
    const selfAmounts = accountEncryptedAmount.selfAmount;
    const incomingAmountsString = JSON.stringify(incomingAmounts);

    const incoming = account.incomingAmounts !== incomingAmountsString;
    const checkExternalSelfUpdate =
        account.selfAmounts !== selfAmounts &&
        !(await hasPendingTransactions(account.address));

    if (incoming || checkExternalSelfUpdate) {
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
    const firstCredential = accountInfo.accountCredentials[0];
    const address = await getAddressFromCredentialId(
        getCredId(firstCredential)
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
        dispatch(
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
    const updatedFields = { signatureThreshold };
    updateAccount(address, updatedFields);
    return dispatch(updateAccountFields({ address, updatedFields }));
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

    const encryptedAmountsUpdate = await updateAccountEncryptedAmount(
        account,
        accountInfo.accountEncryptedAmount
    );

    accountUpdate = { ...encryptedAmountsUpdate, ...accountUpdate };

    if (Object.keys(accountUpdate).length > 0) {
        await updateAccount(account.address, accountUpdate);
        dispatch(
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
    dispatch: Dispatch,
    resetInfo = true
) {
    const map: Record<string, AccountInfo> = {};

    // We don't check that the address is valid for genesis account, because they have a credId as placeholder.
    // The lookup for accountInfo will still succeed, because the node will, given an invalid address, interpret it as a credId,
    // and return the associated accounts's info.
    // Can only be safely removed, if there are no more genesis accounts in circulation, either in
    // databases or in old exports.
    const confirmedAccounts = accounts.filter(
        (account) =>
            (isValidAddress(account.address) &&
                account.status === AccountStatus.Confirmed) ||
            AccountStatus.Genesis === account.status
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
            map[address] = toStringBigInts(accountInfo);
        } else {
            if (!accountInfo) {
                throw new Error(
                    'A confirmed account does not exist on the connected node. Please check that your node is up to date with the blockchain.'
                );
            }
            map[account.address] = toStringBigInts(accountInfo);
            await updateAccountFromAccountInfo(dispatch, account, accountInfo);
        }
    }
    if (resetInfo) {
        return dispatch(setAccountInfos(map));
    }
    return dispatch(addToAccountInfos(map));
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
            updateAccountInfoEntry({
                address: account.address,
                accountInfo: toStringBigInts(accountInfo),
            })
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
    const account = createAccount(
        identityId,
        accountAddress,
        AccountStatus.Pending,
        accountName,
        undefined,
        isInitial,
        deploymentTransactionId
    );
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function confirmInitialAccount(
    dispatch: Dispatch,
    identityId: number,
    accountAddress: string
) {
    await updateInitialAccount(identityId, {
        status: AccountStatus.Confirmed,
        address: accountAddress,
    });
    return loadAccounts(dispatch);
}

// Attempts to confirm account by checking the status of the given transaction
// (Which is assumed to be of the credentialdeployment)
export async function confirmAccount(
    dispatch: Dispatch,
    accountAddress: string,
    transactionId: string
) {
    const response = await getStatus(transactionId);
    switch (response.status) {
        case TransactionStatus.Rejected:
            await updateAccount(accountAddress, {
                status: AccountStatus.Rejected,
            });
            break;
        case TransactionStatus.Finalized:
            await updateAccount(accountAddress, {
                status: AccountStatus.Confirmed,
            });
            // eslint-disable-next-line no-case-declarations
            const account = (await getAccount(accountAddress)) as Account;

            addToAddressBook(dispatch, {
                name: account.name,
                address: accountAddress,
                note: `Account of identity: ${account.identityName}`,
                readOnly: true,
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
    global: Global,
    dispatch: Dispatch
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

    const updatedFields = {
        totalDecrypted,
        allDecrypted: true,
    };
    updateAccount(account.address, updatedFields);
    return dispatch(
        updateAccountFields({ address: account.address, updatedFields })
    );
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
        maxTransactionId: '0',
        isInitial: false,
        transactionFilter: {},
    };
    await insertAccount(account);
    return loadAccounts(dispatch);
}

export async function importAccount(account: Account | Account[]) {
    await insertAccount(account);
}

export async function updateTransactionFilter(
    dispatch: Dispatch,
    address: string,
    transactionFilter: TransactionFilter,
    persist: boolean
) {
    const updatedFields = { transactionFilter };

    if (persist) {
        updateAccount(address, updatedFields);
    }

    return dispatch(updateAccountFields({ address, updatedFields }));
}

export async function updateMaxTransactionId(
    dispatch: Dispatch,
    address: string,
    maxTransactionId: string
) {
    const updatedFields = { maxTransactionId };
    return dispatch(updateAccountFields({ address, updatedFields }));
}

export async function updateAllDecrypted(
    dispatch: Dispatch,
    address: string,
    allDecrypted: boolean
) {
    const updatedFields = { allDecrypted };
    updateAccount(address, updatedFields);
    return dispatch(updateAccountFields({ address, updatedFields }));
}

export async function updateShieldedBalance(
    dispatch: Dispatch,
    address: string,
    selfAmounts: string,
    totalDecrypted: string
) {
    const updatedFields = { selfAmounts, totalDecrypted };
    updateAccount(address, updatedFields);
    return dispatch(updateAccountFields({ address, updatedFields }));
}

export async function editAccountName(
    dispatch: Dispatch,
    address: string,
    name: string
) {
    const updatedFields: Partial<Account> = { name };
    await updateAccount(address, updatedFields);
    await updateAddressBookEntry(dispatch, address, { name });

    return dispatch(updateAccountFields({ address, updatedFields }));
}

export async function toggleAccountView(dispatch: Dispatch) {
    const simpleViewActive = await accountSimpleView.get();

    await accountSimpleView.set(!simpleViewActive);
    return loadSimpleViewActive(dispatch);
}

export async function setDefaultAccount(dispatch: Dispatch, address: string) {
    await defaultAccount.set(address);
    loadDefaultAccount(dispatch);
}

export function clearRewardFilters(dispatch: Dispatch, address: string) {
    return updateTransactionFilter(
        dispatch,
        address,
        {} as TransactionFilter,
        true
    );
}

export default accountsSlice.reducer;
