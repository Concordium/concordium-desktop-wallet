import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import * as crypto from 'crypto';
import { RootState } from '../../store';
import { getBlockSummary, sendTransaction } from '../../utils/client';
import {
    serializeTransaction,
    serializeCredentialDeployment,
} from '../../utils/transactionSerialization';
import {
    buildCredDep,
    makeTestTransferWithScheduleTransaction,
    binaryVersionAsHex,
} from '../../utils/test';

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
        identities: [{ name: 'Bob' }, { name: 'Alice' }],
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

export const identities = (state: RootState) => state.accounts.identities;

export const accounts = (state: RootState) => state.accounts.accounts;

export const chosenIdentity = (state: RootState) =>
    state.accounts.chosenIdentity;

export const chosenAccount = (state: RootState) => state.accounts.chosenAccount;

export const { chooseIdentity, chooseAccount } = accountsSlice.actions;

export default accountsSlice.reducer;
