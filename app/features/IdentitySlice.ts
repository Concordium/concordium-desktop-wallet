import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
// eslint-disable-next-line import/no-cycle
import { loadAccounts } from './AccountSlice';
import {
    getAllIdentities,
    updateIdentity,
    removeIdentity as removeIdentityInDatabase,
} from '../database/IdentityDao';
import { Identity, Dispatch } from '../utils/types';
import { isConfirmedIdentity } from '~/utils/identityHelpers';

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
    },
});

export const { updateIdentities, chooseIdentity } = identitySlice.actions;

export const identitiesSelector = (state: RootState) =>
    state.identities.identities;

export const confirmedIdentitiesSelector = (state: RootState) =>
    state.identities.identities.filter(isConfirmedIdentity);

export const chosenIdentitySelector = (state: RootState) =>
    state.identities.identities.find(
        (i) => i.id === state.identities.chosenIdentityId
    );

export const specificIdentitySelector = (identityId: number) => (
    state: RootState
) => state.identities.identities.find((i) => i.id === identityId);

export async function loadIdentities(dispatch: Dispatch) {
    const identities: Identity[] = await getAllIdentities();
    dispatch(updateIdentities(identities));
}

export async function removeIdentity(dispatch: Dispatch, identityId: number) {
    await removeIdentityInDatabase(identityId);
    return Promise.all([loadAccounts(dispatch), loadIdentities(dispatch)]);
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
