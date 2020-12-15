import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import * as storage from '../utils/persistentStorage';
import { getIdObject } from '../utils/httpRequests';
import { getTransactionStatus } from '../utils/client';
const accountStorageKey = 'accounts';
const identityStorageKey = 'identities';
const identityObjectStorageKey = 'identityObjects';

interface Identity {
    name: string;
    status: string;
    AttributeList;
} // TODO: Make proper with all details

function createAccount(name) {
    return {
        name,
        status: 'pending',
        address: 'unknown',
    };
}

function createIdentity(identityName, initialAccountName, provider) {
    return {
        name: identityName,
        status: 'pending',
        provider,
        attributes: [],
        accounts: [createAccount(initialAccountName)],
    };
}

function makeAttributes(identityObject) {
    return identityObject.value.attributeList;
}

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        identities: undefined,
        chosenIdentity: undefined,
        chosenIdentityIndex: undefined,
        chosenAccount: undefined,
        chosenAccountIndex: undefined,
    },
    reducers: {
        chooseIdentity: (state, index) => {
            state.chosenIdentityIndex = index.payload;
            state.chosenIdentity = state.identities[index.payload];
            state.chosenAccountIndex = 0;
            state.chosenAccount = state.chosenIdentity.accounts[0];
        },
        chooseAccount: (state, index) => {
            state.chosenAccountIndex = index.payload;
            state.chosenAccount = state.chosenIdentity.accounts[index.payload];
        },
        addIdentity: (state, data) => {
            const { identityName, accountName } = data.payload;

            const identity = createIdentity(identityName, accountName);
            state.identities.push(identity);
            storage.save(identityStorageKey, state.identities);

            state.chosenIdentity = identity;
            state.chosenIdentityIndex = state.identities.length - 1;
            state.chosenAccount = identity.accounts[0];
            state.chosenAccountIndex = 0;
        },
        setIdentities: (state, identities) => {
            state.identities = identities.payload;
        },
        confirmIdentityAction: (state, data) => {
            const {
                identityName,
                identityObject,
                accountAddress,
            } = data.payload;
            const index = state.identities.findIndex(
                (identity) => identity.name == identityName
            );
            const identity = state.identities[index];
            identity.status = 'confirmed';
            identity.attributes = makeAttributes(identityObject);
            identity.accounts[0].address = accountAddress;
            state.identities[index] = identity;

            storage.save(identityStorageKey, state.identities);
        },
        rejectIdentityAction: (state, identityName) => {
            const identity = state.identities.find(
                (identity) => identity.name == identityName.payload
            );
            identity.status = 'rejected';
        },
        addAccount: (state, data) => {
            const { identityName, accountName } = data.payload;

            const index = state.identities.findIndex(
                (identity) => identity.name == identityName
            );

            state.identities[index].accounts.push(accountName);
            storage.save(identityStorageKey, state.identities);
        },
        confirmAccountAction: (state, data) => {
            console.log(data.payload, 'has been confirmed');
        },
    },
});

export const identitiesSelector = (state: RootState) =>
    state.accounts.identities;

export const accountsSelector = (state: RootState) => {
    const { identities } = state.accounts;
    const chosenIdentity = identities
        ? identities[state.accounts.chosenIdentityIndex]
        : undefined;
    return chosenIdentity ? chosenIdentity.accounts : [];
};

export const chosenIdentitySelector = (state: RootState) =>
    state.accounts.identities
        ? state.accounts.identities[state.accounts.chosenIdentityIndex]
        : undefined;

export const chosenIdentityIndexSelector = (state: RootState) =>
    state.accounts.chosenIdentityIndex;

export const chosenAccountSelector = (state: RootState) =>
    state.accounts.chosenAccount;

export const chosenAccountIndexSelector = (state: RootState) =>
    state.accounts.chosenAccountIndex;

export const {
    chooseIdentity,
    chooseAccount,
    addIdentity,
    addAccount,
} = accountsSlice.actions;
const {
    setIdentities,
    setAccounts,
    rejectIdentityAction,
    confirmIdentityAction,
    confirmAccountAction
} = accountsSlice.actions;

export async function loadIdentities(dispatch) {
    storage
        .load(identityStorageKey)
        .then((identities) => dispatch(setIdentities(identities || [])))
        .catch(console.warn('unable to load identities'));
}

export async function confirmIdentity(dispatch, identityName, location) {
    getIdObject(location)
        .then((token) => {
            const input = {
                identityName,
                identityObject: token.identityObject,
                accountAddress: token.accountAddress,
            };

            console.log('-----');
            dispatch(confirmIdentityAction(input));
        })
        .catch((err) => {
            dispatch(rejectIdentityAction(identityName));
        });
}

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function confirmAccount(dispatch, accountName, transactionId) {
    while (true) {
        const response =  await getTransactionStatus(transactionId);
        const data = response.getValue();
        console.log(data);
        if (data === "null") {
            console.log(data);
        } else {
            dataObject = JSON.parse(data);
            const status = dataObject.status;
            if (status === "finalized") {
                dispatch(confirmAccountAction(accountName));
                break;
            }
        }
        await sleep(10000);
    }
}


export default accountsSlice.reducer;
