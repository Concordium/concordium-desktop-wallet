import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '~/store/store';
import { insertCredential, getCredentials } from '~/database/CredentialDao';
import { Credential, CredentialDeploymentInformation } from '~/utils/types';

interface CredentialState {
    credentials: Credential[];
}

const credentialSlice = createSlice({
    name: 'credentials',
    initialState: {
        credentials: [],
    } as CredentialState,
    reducers: {
        updateCredentials: (state, input) => {
            state.credentials = input.payload;
        },
        addCredential: (state, input) => {
            state.credentials = [...state.credentials, input.payload];
        },
    },
});

export const credentialsSelector = (state: RootState) =>
    state.credentials.credentials;
export const { updateCredentials, addCredential } = credentialSlice.actions;

export async function loadCredentials(dispatch: Dispatch) {
    const credentials: Credential[] = await getCredentials();
    dispatch(updateCredentials(credentials));
}

export async function importCredentials(credentials: Credential[]) {
    return Promise.all(credentials.map(insertCredential));
}

export async function insertNewCredential(
    dispatch: Dispatch,
    accountAddress: string,
    credentialNumber: number,
    identityId: number,
    credential: Pick<CredentialDeploymentInformation, 'credId' | 'policy'>
) {
    const parsed = {
        credId: credential.credId,
        external: false,
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialNumber,
        identityId,
    };
    await insertCredential(parsed);
    return dispatch(addCredential(parsed));
}

export default credentialSlice.reducer;
