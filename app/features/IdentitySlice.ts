import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import { getAllIdentities } from '../database/IdentityDao';
import { Identity } from '../utils/types';

const identitySlice = createSlice({
    name: 'identities',
    initialState: {
        identities: [],
        chosenIdentity: undefined
    },
    reducers: {
        updateIdentities: (state, index) => {
            state.identities = index.payload;
        },
        chooseIdentity: (state, index) => {
            state.chosenIdentity = index.payload;
        }
    },
});

export const { updateIdentities, chooseIdentity } = identitySlice.actions;

export const identitiesSelector = (state: RootState) =>
    state.identities.identities;

export const chosenIdentitySelector = (state: RootState) =>
    state.identities.chosenIdentity;

export async function loadIdentities(dispatch: any) {
    let identities: Identity[] = await getAllIdentities();
    dispatch(updateIdentities(identities));
}

export default identitySlice.reducer;
