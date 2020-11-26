import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

interface Identity {
    name: string;
    issuer: string;
    expiresAt: number;
    residenceCountry: string;
} // TODO: Make proper with all details

const accountMasterList = {
    Bob: ['bob1', 'bob2'],
    Alice: ['alice1', 'alice2'],
};

function getAccounts(identity) {
    return accountMasterList[identity];
}

const accountsSlice = createSlice({
    name: 'accounts',
    initialState: {
        identities: [
            {
                name: 'Bob',
                issuer: 'ID',
                expiresAt: 2021,
                residenceCountry: 'Denmark',
            },
            {
                name: 'Alice',
                issuer: 'ID',
                expiresAt: 2021,
                residenceCountry: 'Denmark',
            },
        ],
        chosenIdentity: undefined,
        accounts: [],
        chosenAccount: undefined,
    },
    reducers: {
        chooseIdentity: (state, index) => {
            state.chosenIdentity = index.payload;
            state.accounts = getAccounts(state.identities[index.payload].name);
        },
        chooseAccount: (state, index) => {
            state.chosenAccount = index.payload;
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

export const { chooseIdentity, chooseAccount } = accountsSlice.actions;

export default accountsSlice.reducer;
