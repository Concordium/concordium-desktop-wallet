import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import { getIdentityProviders } from '../utils/httpRequests';

const identityIssuanceSlice = createSlice({
    name: 'identityIssuance',
    initialState: {
        providers: [],
        identityName: '',
        initialAccountName: '',
    },
    reducers: {
        setProviders: (state, providers) => {
            state.providers = providers.payload;
        },
        setNames: (state, names) => {
            const { accountName, identityName } = names.payload;
            state.identityName = identityName;
            state.initialAccountName = accountName;
        },
    },
});

const { setProviders } = identityIssuanceSlice.actions;
export const { setNames } = identityIssuanceSlice.actions;

export const providersSelector = (state: RootState) =>
    state.identityIssuance.providers;

export const accountNameSelector = (state: RootState) =>
    state.identityIssuance.initialAccountName;

export const identityNameSelector = (state: RootState) =>
    state.identityIssuance.identityName;

export function loadProviders(dispatch) {
    getIdentityProviders()
        .then((providers) => dispatch(setProviders(providers.data)))
        .catch(console.log); // TODO: Handle unable to load providers
}

export default identityIssuanceSlice.reducer;
