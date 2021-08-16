import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
// eslint-disable-next-line import/no-cycle
import { loadAccounts } from './AccountSlice';
import {
    getAllIdentities,
    insertIdentity,
    updateIdentity,
    removeIdentityAndInitialAccount as removeIdentityAndInitialAccountInDatabase,
} from '../database/IdentityDao';
import { Identity, IdentityStatus, Dispatch } from '../utils/types';

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

export async function removeIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityId: number
) {
    await removeIdentityAndInitialAccountInDatabase(identityId);
    await loadAccounts(dispatch);
    return loadIdentities(dispatch);
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
