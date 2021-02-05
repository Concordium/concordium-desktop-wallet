import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import {
    getAllIdentities,
    insertIdentity,
    updateIdentity,
} from '../database/IdentityDao';
import {
    Identity,
    IdentityStatus,
    IdentityObject,
    IdentityProvider,
    Dispatch,
} from '../utils/types';

interface IdentityState {
    identities: Identity[];
    chosenIdentity: Identity | undefined;
}

const initialState: IdentityState = {
    identities: [],
    chosenIdentity: undefined,
};

const identitySlice = createSlice({
    name: 'identities',
    initialState,
    reducers: {
        updateIdentities: (state, input) => {
            state.identities = input.payload;
        },
        chooseIdentity: (state, input) => {
            state.chosenIdentity = input.payload;
        },
    },
});

export const { updateIdentities, chooseIdentity } = identitySlice.actions;

export const identitiesSelector = (state: RootState) =>
    state.identities.identities;

export const chosenIdentitySelector = (state: RootState) =>
    state.identities.chosenIdentity;

export async function loadIdentities(dispatch: Dispatch) {
    const identities: Identity[] = await getAllIdentities();
    dispatch(updateIdentities(identities));
}

export async function addPendingIdentity(
    dispatch: Dispatch,
    identityName: string,
    codeUri: string,
    identityProvider: IdentityProvider,
    randomness: string
) {
    const identity = {
        name: identityName,
        status: IdentityStatus.Pending,
        codeUri,
        identityProvider: JSON.stringify(identityProvider),
        randomness,
    };
    await insertIdentity(identity);
    return loadIdentities(dispatch);
}

export async function confirmIdentity(
    dispatch: Dispatch,
    identityName: string,
    identityObject: IdentityObject
) {
    await updateIdentity(identityName, {
        status: IdentityStatus.Confirmed,
        identityObject: JSON.stringify(identityObject),
    });
    await loadIdentities(dispatch);
}

export async function rejectIdentity(dispatch: Dispatch, identityName: string) {
    await updateIdentity(identityName, { status: IdentityStatus.Rejected });
    await loadIdentities(dispatch);
}

export default identitySlice.reducer;
