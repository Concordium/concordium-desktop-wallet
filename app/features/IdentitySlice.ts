import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    getAllIdentities,
    insertIdentity,
    updateIdentity,
    removeIdentityAndInitialAccount as removeIdentityInDatabase,
} from '../database/IdentityDao';
import {
    Identity,
    IdentityStatus,
    IdentityObject,
    IdentityProvider,
    Dispatch,
} from '../utils/types';
// eslint-disable-next-line import/no-cycle
import { loadAccounts, rejectInitialAccount } from './AccountSlice';

interface IdentityState {
    identities: Identity[];
    chosenIdentityId: number | undefined;
}

const initialState: IdentityState = {
    identities: [],
    chosenIdentityId: undefined,
};

const identitySlice = createSlice({
    name: 'identities',
    initialState,
    reducers: {
        updateIdentities: (state, input) => {
            state.identities = input.payload;
        },
        chooseIdentity: (state, input) => {
            state.chosenIdentityId = input.payload;
        },
        removeIdentity: (state, input) => {
            const removedIdentityId = input.payload;
            state.identities = state.identities.filter(
                (identity) => identity.id !== removedIdentityId
            );
        },
    },
});

export const {
    updateIdentities,
    chooseIdentity,
    removeIdentity: removeIdentityInRedux,
} = identitySlice.actions;

export const identitiesSelector = (state: RootState) =>
    state.identities.identities;

export const confirmedIdentitiesSelector = (state: RootState) =>
    state.identities.identities.filter(
        (identity: Identity) => IdentityStatus.Confirmed === identity.status
    );

export const confirmedAndGenesisIdentitiesSelector = (state: RootState) =>
    state.identities.identities.filter((identity: Identity) =>
        [IdentityStatus.Confirmed, IdentityStatus.Genesis].includes(
            identity.status
        )
    );

export const chosenIdentitySelector = (state: RootState) =>
    state.identities.identities.find(
        (i) => i.id === state.identities.chosenIdentityId
    );

export async function loadIdentities(dispatch: Dispatch) {
    const identities: Identity[] = await getAllIdentities();
    dispatch(updateIdentities(identities));
}

export async function addPendingIdentity(
    identityNumber: number,
    dispatch: Dispatch,
    identityName: string,
    codeUri: string,
    identityProvider: IdentityProvider,
    randomness: string,
    walletId: number
) {
    const identity = {
        identityNumber,
        name: identityName,
        status: IdentityStatus.Pending,
        codeUri,
        identityProvider: JSON.stringify(identityProvider),
        randomness,
        walletId,
    };
    const identityId = await insertIdentity(identity);
    loadIdentities(dispatch);
    return identityId[0];
}

export async function confirmIdentity(
    dispatch: Dispatch,
    identityId: number,
    identityObject: IdentityObject
) {
    await updateIdentity(identityId, {
        status: IdentityStatus.Confirmed,
        identityObject: JSON.stringify(identityObject),
    });
    await loadIdentities(dispatch);
}

export async function removeIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityId: number
) {
    await removeIdentityInDatabase(identityId);
    await loadAccounts(dispatch);
    return dispatch(removeIdentityInRedux(identityId));
}

export async function rejectIdentity(dispatch: Dispatch, identityId: number) {
    await updateIdentity(identityId, { status: IdentityStatus.Rejected });
    await rejectInitialAccount(dispatch, identityId);
    await loadIdentities(dispatch);
}

export async function importIdentities(
    identities: Identity | Identity[] | Partial<Identity>
) {
    await insertIdentity(identities);
}

export async function editIdentityName(
    dispatch: Dispatch,
    identityId: number,
    name: string
) {
    await updateIdentity(identityId, { name });
    await loadIdentities(dispatch);
}

export default identitySlice.reducer;
