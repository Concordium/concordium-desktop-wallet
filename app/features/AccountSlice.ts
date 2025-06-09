import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'connected-react-router';
import { AccountInfoType, DelegationTargetType } from '@concordium/web-sdk';

import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { hasPendingTransactions } from '~/database/TransactionDao';
import { accountSimpleView, defaultAccount } from '~/database/PreferencesDao';
import { stringify, parse } from '~/utils/JSONHelper';
import { getCredId } from '~/utils/credentialHelper';
import { throwLoggedError, mapRecordValues } from '~/utils/basicHelpers';
import {
    getAccountInfo,
    getAccountInfoOfCredential,
} from '~/node/nodeRequests';

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
    IdentityVersion,
    AccountExtras,
} from '../utils/types';
import { createAccount, isValidAddress } from '../utils/accountHelpers';
import {
    getAccountInfoOfAddress,
    getPoolStatusLatest,
    getStatus,
    getlastFinalizedBlockHash,
} from '../node/nodeHelpers';

export interface AccountState {
    simpleView: boolean;
    accounts: Account[];
    accountsInfo: Record<string, string>;
    chosenAccountAddress: string;
    accountChanged: boolean;
    defaultAccount: string | undefined;
    accountExtras: Record<string, AccountExtras>;
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

const setChosenAccountAddress = (state: AccountState, address: string) => {
    if (state.chosenAccountAddress !== address) {
        state.accountChanged = true;
    }

    state.chosenAccountAddress = address;
};

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

    const nextChosenAccountAddress =
        confirmedAccountsIndices.find(firstValid)?.[1].address ??
        confirmedAccountsIndices[0]?.[1].address;

    if (nextChosenAccountAddress) {
        setChosenAccountAddress(state, nextChosenAccountAddress);
    }
};

const initialState: AccountState = {
    simpleView: true,
    accounts: [],
    accountsInfo: {},
    chosenAccountAddress: '',
    accountChanged: true,
    defaultAccount: undefined,
    accountExtras: {},
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
            setChosenAccountAddress(state, input.payload);
        },
        updateAccounts: (state, input) => {
            state.accounts = input.payload;

            if (!state.chosenAccountAddress) {
                setChosenAccountAddress(
                    state,
                    state.defaultAccount || state.accounts[0]?.address || ''
                );
            }
        },
        setAccountInfos: (
            state,
            map: PayloadAction<Record<string, string>>
        ) => {
            state.accountsInfo = map.payload;
        },
        setDefaultAccount(state, input: PayloadAction<Hex | undefined>) {
            state.defaultAccount = input.payload;

            if (input.payload) {
                setChosenAccountAddress(state, input.payload);
            }
        },
        setSuspensionStatus(
            state,
            input: PayloadAction<{
                address: string;
                isSuspended: boolean;
            }>
        ) {
            if (state.accountExtras[input.payload.address] === undefined) {
                state.accountExtras[input.payload.address] = {};
            }

            state.accountExtras[input.payload.address].isSuspended =
                input.payload.isSuspended;
        },
        addToAccountInfos: (
            state,
            map: PayloadAction<Record<string, string>>
        ) => {
            state.accountsInfo = { ...state.accountsInfo, ...map.payload };
        },
        updateAccountInfoEntry: (
            state,
            update: PayloadAction<{ address: string; accountInfo: string }>
        ) => {
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
    extraReducers(builder) {
        builder.addCase(LOCATION_CHANGE, (state) => {
            state.accountChanged = false;
        });
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
    mapRecordValues<string, string, AccountInfo>(
        state.accounts.accountsInfo,
        parse
    );

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.accounts.find(
        (a) => a.address === state.accounts.chosenAccountAddress
    );

export const chosenAccountInfoSelector = (
    state: RootState
): AccountInfo | undefined =>
    parse(
        state.accounts.accountsInfo?.[
            chosenAccountSelector(state)?.address ?? ''
        ]
    );

export const chosenAccountExtrasSelector = (
    state: RootState
): AccountExtras | undefined =>
    state.accounts.accountExtras?.[chosenAccountSelector(state)?.address ?? ''];

export const accountInfoSelector = (account?: Account) => (
    state: RootState
): AccountInfo | undefined =>
    parse(state.accounts.accountsInfo?.[account?.address ?? '']);

export const defaultAccountSelector = (state: RootState) =>
    state.accounts.accounts.find(
        (a) => a.address === state.accounts.defaultAccount
    );

export const {
    chooseAccount,
    nextConfirmedAccount,
    previousConfirmedAccount,
} = accountsSlice.actions;

const {
    updateAccounts,
    updateAccountFields,
    setSuspensionStatus,
} = accountsSlice.actions;

function updateAccountInfoEntry(
    dispatch: Dispatch,
    address: string,
    accountInfo: AccountInfo
) {
    dispatch(
        accountsSlice.actions.updateAccountInfoEntry({
            address,
            accountInfo: stringify(accountInfo),
        })
    );
}

function setAccountInfos(
    dispatch: Dispatch,
    infos: Record<string, AccountInfo>
) {
    dispatch(
        accountsSlice.actions.setAccountInfos(mapRecordValues(infos, stringify))
    );
}

function addToAccountInfos(
    dispatch: Dispatch,
    infos: Record<string, AccountInfo>
) {
    dispatch(
        accountsSlice.actions.addToAccountInfos(
            mapRecordValues(infos, stringify)
        )
    );
}

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
    address: string,
    accountEncryptedAmount: AccountEncryptedAmount
): Promise<Partial<Account>> {
    const { incomingAmounts } = accountEncryptedAmount;
    const selfAmounts = accountEncryptedAmount.selfAmount;
    const incomingAmountsString = JSON.stringify(incomingAmounts);
    // Get the account and hasPending from the database at the same time, to avoid race condition with transaction finalization.
    const account = await getAccount(address);
    if (!account) {
        throw new Error(
            `Account, ${address}, was unexpectedly not in the database`
        );
    }
    const hasPending = await hasPendingTransactions(address);
    const incoming = account.incomingAmounts !== incomingAmountsString;
    const checkExternalSelfUpdate =
        account.selfAmounts !== selfAmounts && !hasPending;

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
        account.address,
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

    let validatorId: bigint | undefined;
    if (accountInfo.type === AccountInfoType.Baker) {
        validatorId = accountInfo.accountBaker.bakerId;
    } else if (
        accountInfo.type === AccountInfoType.Delegator &&
        accountInfo.accountDelegation.delegationTarget.delegateType ===
            DelegationTargetType.Baker
    ) {
        validatorId = accountInfo.accountDelegation.delegationTarget.bakerId;
    }

    if (validatorId !== undefined) {
        const poolStatus = await getPoolStatusLatest(validatorId);
        /* if (poolStatus.isSuspended) {
            dispatch(
                setSuspensionStatus({
                    address: account.address,
                    isSuspended: true,
                })
            );
        }
            */

        dispatch(
            setSuspensionStatus({
                address: account.address,
                isSuspended: !!poolStatus.isSuspended,
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

    const confirmedAccounts = accounts.filter(
        (account) =>
            isValidAddress(account.address) &&
            account.status === AccountStatus.Confirmed
    );

    // We don't check that the addresses is valid for genesis accounts, because they have credId's as placeholders.
    // The lookup for accountInfo will still succeed, because the node will, given an invalid address, interpret it as a credId,
    // and return the associated accounts's info.
    // Can only be safely removed, if there are no more genesis accounts in circulation, either in
    // databases or in old exports.
    const genesisAccounts = accounts.filter(
        (account) => AccountStatus.Genesis === account.status
    );

    if (confirmedAccounts.length + genesisAccounts.length === 0) {
        return Promise.resolve();
    }

    const blockHash = await getlastFinalizedBlockHash();
    for (const account of confirmedAccounts) {
        let accountInfo: AccountInfo;
        try {
            accountInfo = await getAccountInfo(account.address, blockHash);
        } catch {
            throw new Error(
                `A confirmed account (${account.name}) does not exist on the connected node. Please check that your node is up to date with the blockchain. Account Address: ${account.address}`
            );
        }
        map[account.address] = accountInfo;
        await updateAccountFromAccountInfo(dispatch, account, accountInfo);
    }

    for (const account of genesisAccounts) {
        let accountInfo: AccountInfo;
        try {
            accountInfo = await getAccountInfoOfCredential(
                // account.address contains the placeholder credId
                account.address,
                blockHash
            );
        } catch (e) {
            throwLoggedError(
                `Genesis account '${account.name}' not found on chain. Associated credId: ${account.address}`
            );
        }
        const address = await initializeGenesisAccount(
            dispatch,
            account,
            accountInfo
        );
        map[address] = accountInfo;
    }

    if (resetInfo) {
        return setAccountInfos(dispatch, map);
    }
    return addToAccountInfos(dispatch, map);
}

/**
 * Updates the account info, of the account with the given address, in the state.
 * If given an address of an account that doesn't exist on chain, this throws an error.
 */
export async function updateAccountInfoOfAddress(
    address: string,
    dispatch: Dispatch
) {
    const accountInfo = await getAccountInfoOfAddress(address);
    return updateAccountInfoEntry(dispatch, address, accountInfo);
}

/**
 * Updates the given account's accountInfo, in the state, and check if there is updates to the account.
 * If given an address of an account that doesn't exist on chain, this throws an error.
 */
export async function updateAccountInfo(
    account: Account,
    currentInfo: AccountInfo | undefined,
    dispatch: Dispatch
) {
    const accountInfo = await getAccountInfoOfAddress(account.address);
    if (stringify(accountInfo) !== stringify(currentInfo)) {
        await updateAccountFromAccountInfo(dispatch, account, accountInfo);
        updateAccountInfoEntry(dispatch, account.address, accountInfo);
    }
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
            window.log.warn('account creation was rejected.');
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
            throwLoggedError(
                `Unexpected status was returned by the poller: ${response}`
            );
    }
    return loadAccounts(dispatch);
}

// Decrypts the shielded account balance of the given account, using the prfKey.
// This function expects the prfKey to match the account's prfKey.
export async function decryptAccountBalance(
    account: Account,
    prfKey: string,
    identityVersion: IdentityVersion,
    credentialNumber: number,
    global: Global,
    dispatch: Dispatch
) {
    if (!account.incomingAmounts) {
        throwLoggedError(
            'Unexpected missing incoming amounts when decrypting!'
        );
    }
    const encryptedAmounts = JSON.parse(account.incomingAmounts);
    encryptedAmounts.push(account.selfAmounts);

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        credentialNumber,
        global,
        prfKey,
        identityVersion
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
