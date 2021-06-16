import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
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

export const confirmedIdentitiesSelector = (state: RootState) =>
    state.identities.identities.filter(
        (identity: Identity) => IdentityStatus.Confirmed === identity.status
    );

export const chosenIdentitySelector = (state: RootState) =>
    state.identities.chosenIdentity;

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

export async function rejectIdentity(dispatch: Dispatch, identityId: number) {
    await updateIdentity(identityId, { status: IdentityStatus.Rejected });
    await loadIdentities(dispatch);
}

export async function importIdentities(
    identities: Identity | Identity[] | Partial<Identity>
) {
    await insertIdentity(identities);
}

export default identitySlice.reducer;
