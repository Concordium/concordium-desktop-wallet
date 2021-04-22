import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '~/store/store';
import {
    insertCredential,
    getCredentials,
    updateCredentialIndex as updateCredentialIndexInDatabase,
    getCredentialsOfAccount,
} from '~/database/CredentialDao';
import {
    Credential,
    CredentialDeploymentInformation,
    AccountInfo,
    instanceOfDeployedCredential,
} from '~/utils/types';

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
        updateCredential: (state, update) => {
            const { credId, ...fields } = update.payload;
            const index = state.credentials.findIndex(
                (cred) => cred.credId === credId
            );
            if (index > -1) {
                state.credentials[index] = {
                    ...state.credentials[index],
                    ...fields,
                };
            }
        },
    },
});

export const credentialsSelector = (state: RootState) =>
    state.credentials.credentials;

export const {
    updateCredentials,
    addCredential,
    updateCredential,
} = credentialSlice.actions;

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
    credentialIndex: number | undefined,
    credential: Pick<CredentialDeploymentInformation, 'credId' | 'policy'>
) {
    const parsed = {
        credId: credential.credId,
        external: false,
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialNumber,
        identityId,
        credentialIndex,
    };
    await insertCredential(parsed);
    return dispatch(addCredential(parsed));
}

export async function insertExternalCredential(
    dispatch: Dispatch,
    accountAddress: string,
    credentialIndex: number | undefined,
    credential: Pick<CredentialDeploymentInformation, 'credId' | 'policy'>
) {
    const parsed = {
        credId: credential.credId,
        external: true,
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialIndex,
    };
    await insertCredential(parsed);
    return dispatch(addCredential(parsed));
}

/**
 * updates the credentialIndex of the credential with the given credId.
 * @param credentialIndex, the new value to set. If this is undefined, this will remove the current index.
 */
export async function updateCredentialIndex(
    dispatch: Dispatch,
    credId: string,
    credentialIndex: number | undefined
) {
    updateCredentialIndexInDatabase(credId, credentialIndex);
    return dispatch(updateCredential({ credId, credentialIndex }));
}

export async function updateCredentialsStatus(
    dispatch: Dispatch,
    accountAddress: string,
    accountInfo: AccountInfo
) {
    const localCredentials = await getCredentialsOfAccount(accountAddress);
    const onChainCredentials: [
        CredentialDeploymentInformation,
        number
    ][] = Object.entries(
        accountInfo.accountCredentials
    ).map(([index, versioned]) => [
        versioned.value.contents,
        parseInt(index, 10),
    ]);

    // Find any credentials, which have been removed from the account, and remove their (former) index.
    const removed = localCredentials.filter(
        (cred) =>
            instanceOfDeployedCredential(cred) &&
            !onChainCredentials.some(
                ([onChainCredential]) =>
                    cred.credId === onChainCredential.credId
            )
    );
    removed.forEach((cred) =>
        updateCredentialIndex(dispatch, cred.credId, undefined)
    );

    // Find any local credentials, which have been deployed on the account, and attach their index.
    localCredentials.forEach((cred) => {
        if (!instanceOfDeployedCredential(cred)) {
            const onChainReference = onChainCredentials.find(
                ([onChainCredential]) =>
                    cred.credId === onChainCredential.credId
            );
            if (onChainReference) {
                const [, credentialIndex] = onChainReference;
                updateCredentialIndex(dispatch, cred.credId, credentialIndex);
            }
        }
    });

    // Check if any external credentials have been added to the account. If so, then add them.
    const newCredentials = onChainCredentials.filter(
        ([onChainCredential]) =>
            !localCredentials.some(
                (cred) => cred.credId === onChainCredential.credId
            )
    );
    newCredentials.forEach(([onChainCredential, index]) =>
        insertExternalCredential(
            dispatch,
            accountAddress,
            index,
            onChainCredential
        )
    );
}

export default credentialSlice.reducer;
