import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { insertCredential, getCredentials } from '../database/CredentialDao';
import { Credential, CredentialDeploymentInformation } from '../utils/types';

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
    },
});

export const credentialsSelector = (state: RootState) =>
    state.credentials.credentials;
export const { updateCredentials } = credentialSlice.actions;

export async function loadCredentials(dispatch: Dispatch) {
    const identities: Credential[] = await getCredentials();
    dispatch(updateCredentials(identities));
}

export async function importCredentials(credentials: Credential[]) {
    return Promise.all(credentials.map(insertCredential));
}

export async function insertNewCredential(
    accountAddress: string,
    credentialNumber: number,
    identityId: number,
    credential: CredentialDeploymentInformation
) {
    const parsed = {
        ...credential,
        arData: JSON.stringify(credential.arData),
        credentialPublicKeys: JSON.stringify(credential.credentialPublicKeys),
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialNumber,
        identityId,
    };
    return insertCredential(parsed);
}

export default credentialSlice.reducer;
