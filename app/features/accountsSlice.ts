import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import * as storage from '../utils/persistentStorage';

const accountStorageKey = 'accounts';
const identityStorageKey = 'identities';
const identityObjectStorageKey = 'identityObjects';

interface Identity {
    name: string;
    status: string;
    signature: string;
    AttributeList;
} // TODO: Make proper with all details

function createAccount(accountName, accountAddress) {
    return {
        name: accountName,
        address: accountAddress,
    };
}

function createIdentity(identityName, identityObject) {
    storage.save(
        `${identityObjectStorageKey}/${identityObject.value.signature}`,
        identityObject
    );
    return {
        name: identityName,
        signature: identityObject.value.signature,
        attributeList: identityObject.value.attributeList,
    };
}

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        identities: [],
        chosenIdentity: undefined,
        accounts: [],
        chosenAccount: undefined,
        accountMasterList: [],
    },
    reducers: {
        chooseIdentity: (state, index) => {
            state.chosenIdentity = index.payload;
            const accountsEntry = state.accountMasterList.find(
                (entry) =>
                    entry.signature ===
                    state.identities[index.payload].signature
            );
            if (accountsEntry) {
                state.accounts = accountsEntry.accounts;
            } else {
                console.warn('No entry in AccountsList for chosen identity.');
                state.accounts = [];
            }
            state.chosenAccount = 0;
        },
        chooseAccount: (state, index) => {
            state.chosenAccount = index.payload;
        },
        addIdentity: (state, data) => {
            const {
                identityName,
                identityObject,
                accountName,
                accountAddress,
            } = data.payload;

            const identity = createIdentity(identityName, identityObject);
            state.identities.push(identity);
            storage.save(identityStorageKey, state.identities);
            state.chosenIdentity = state.identities.length - 1;

            state.accountMasterList.push({
                accounts: [createAccount(accountName, accountAddress)],
                signature: identityObject.value.signature,
            });
            storage.save(accountStorageKey, state.accountMasterList);
            state.accounts =
                state.accountMasterList[state.chosenIdentity].accounts;
            state.chosenAccount = 0;
        },
        setIdentities: (state, identities) => {
            state.identities = identities.payload;
        },
        setAccounts: (state, accounts) => {
            state.accountMasterList = accounts.payload;
        },
    },
});

export const identitiesSelector = (state: RootState) =>
    state.accounts.identities;

export const accountsSelector = (state: RootState) => state.accounts.accounts;

export const chosenIdentitySelector = (state: RootState) =>
    state.accounts.chosenIdentity;

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.chosenAccount;

export const {
    chooseIdentity,
    chooseAccount,
    addIdentity,
} = accountsSlice.actions;
const { setIdentities, setAccounts } = accountsSlice.actions;

export async function loadIdentities(dispatch) {
    storage
        .load(identityStorageKey)
        .then((identities) => dispatch(setIdentities(identities || [])))
        .catch(console.warn('unable to load identities'));
    storage
        .load(accountStorageKey)
        .then((accounts) => dispatch(setAccounts(accounts || [])))
        .catch(console.warn('unable to load accounts'));
}

export default accountsSlice.reducer;
