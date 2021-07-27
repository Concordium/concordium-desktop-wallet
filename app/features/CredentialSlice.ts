import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '~/store/store';
import {
    insertCredential,
    getCredentials,
    updateCredential as updateCredentialInDatabase,
    getCredentialsOfAccount,
} from '~/database/CredentialDao';
import {
    Credential,
    CredentialDeploymentInformation,
    Account,
    AccountInfo,
    instanceOfDeployedCredential,
    AddedCredential,
    MakeOptional,
    CredentialStatus,
} from '~/utils/types';
import { ExternalCredential } from '~/database/types';
import {
    deleteExternalCredentials,
    getAllExternalCredentials,
    upsertExternalCredential,
    upsertMultipleExternalCredentials,
} from '~/database/ExternalCredentialDao';
import {
    getCredentialsFromAccountInfo,
    getCredentialStatus,
} from '~/utils/credentialHelper';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';

interface CredentialState {
    credentials: Credential[];
    externalCredentials: ExternalCredential[];
}

const credentialSlice = createSlice({
    name: 'credentials',
    initialState: {
        credentials: [],
        externalCredentials: [],
    } as CredentialState,
    reducers: {
        updateCredentials: (state, input) => {
            state.credentials = input.payload;
        },
        addCredential: (state, input) => {
            state.credentials = [...state.credentials, input.payload];
        },
        updateCredential: (state, update) => {
            const { credId, updatedFields } = update.payload;
            const index = state.credentials.findIndex(
                (cred) => cred.credId === credId
            );
            if (index > -1) {
                state.credentials[index] = {
                    ...state.credentials[index],
                    ...updatedFields,
                };
            }
        },
        addExternalCredential(
            state,
            action: PayloadAction<ExternalCredential>
        ) {
            state.externalCredentials.push(action.payload);
        },
        updateExternalCredentials(
            state,
            action: PayloadAction<ExternalCredential[]>
        ) {
            state.externalCredentials = action.payload;
        },
    },
});

export const credentialsSelector = (state: RootState) =>
    state.credentials.credentials;

export const externalCredentialsSelector = (state: RootState) =>
    state.credentials.externalCredentials;

export const accountHasDeployedCredentialsSelector = (account: Account) => (
    state: RootState
) =>
    state.credentials.credentials.some(
        (cred) =>
            cred.accountAddress === account.address &&
            instanceOfDeployedCredential(cred)
    );

export const {
    updateCredentials,
    addCredential,
    updateCredential: updateCredentialInRedux,
    addExternalCredential,
    updateExternalCredentials,
} = credentialSlice.actions;

async function updateCredential(
    dispatch: Dispatch,
    credId: string,
    updatedFields: Partial<Credential>
) {
    await updateCredentialInDatabase(credId, updatedFields);
    return dispatch(updateCredentialInRedux({ credId, updatedFields }));
}

export async function updateOffChainCredentials(credentials: Credential[]) {
    try {
        const blockHash = await getlastFinalizedBlockHash();

        return Promise.all(
            credentials.map(async (credential) => {
                if (credential.status !== CredentialStatus.Offchain) {
                    return credential;
                }
                const statusUpdate = await getCredentialStatus(
                    credential.credId,
                    blockHash
                );
                await updateCredentialInDatabase(
                    credential.credId,
                    statusUpdate
                );
                return { ...credential, ...statusUpdate };
            })
        );
    } catch {
        return credentials;
    }
}

export async function loadCredentials(dispatch: Dispatch) {
    let credentials: Credential[] = await getCredentials();
    if (
        credentials.some(({ status }) => status === CredentialStatus.Offchain)
    ) {
        credentials = await updateOffChainCredentials(credentials);
    }
    dispatch(updateCredentials(credentials));
}

export async function loadExternalCredentials(dispatch: Dispatch) {
    const ex: ExternalCredential[] = await getAllExternalCredentials();
    dispatch(updateExternalCredentials(ex));
}

export async function importCredentials(credentials: Credential[]) {
    return Promise.all(credentials.map(insertCredential));
}

export async function importExternalCredentials(
    credentials?: ExternalCredential[]
) {
    if (!credentials?.length) {
        return;
    }

    // eslint-disable-next-line consistent-return
    return upsertMultipleExternalCredentials(credentials);
}

export async function insertNewCredential(
    dispatch: Dispatch,
    accountAddress: string,
    credentialNumber: number,
    identityId: number,
    credentialIndex: number | undefined,
    status: CredentialStatus,
    credential: Pick<CredentialDeploymentInformation, 'credId' | 'policy'>
) {
    const parsed = {
        credId: credential.credId,
        policy: JSON.stringify(credential.policy),
        accountAddress,
        credentialNumber,
        identityId,
        credentialIndex,
        status,
    };
    await insertCredential(parsed);
    return loadCredentials(dispatch);
}

export async function updateExternalCredential(
    dispatch: Dispatch,
    credential: ExternalCredential
) {
    await upsertExternalCredential(credential);
    return loadExternalCredentials(dispatch);
}

export async function insertExternalCredentials(
    dispatch: Dispatch,
    accountAddress: string,
    credentials: AddedCredential[]
) {
    if (!credentials.length) {
        return;
    }

    const creds: MakeOptional<ExternalCredential, 'note'>[] = credentials.map(
        (c) => ({
            accountAddress,
            credId: c.value.credId,
            note: c.note,
        })
    );

    await upsertMultipleExternalCredentials(creds);
    // eslint-disable-next-line consistent-return
    return loadExternalCredentials(dispatch);
}

export async function removeExternalCredentials(
    dispatch: Dispatch,
    credIds: string[]
) {
    if (!credIds.length) {
        return;
    }

    await deleteExternalCredentials(credIds);
    // eslint-disable-next-line consistent-return
    return loadExternalCredentials(dispatch);
}

/**
 * Adds the credential's credentialIndex and updates the account address (Because previously this was a credId acting as a placeholder).
 */
export async function initializeGenesisCredential(
    dispatch: Dispatch,
    accountAddress: string,
    credential: Credential,
    accountInfo: AccountInfo
) {
    const credentialOnChain = Object.entries(
        accountInfo.accountCredentials
    ).find(
        ([, cred]) =>
            (cred.value.contents.credId || cred.value.contents.regId) ===
            credential.credId
    );
    if (!credentialOnChain) {
        throw new Error(
            `Unexpected missing reference to genesis credential on chain, with credId: ${credential.credId}`
        );
    }

    const credentialIndex = parseInt(credentialOnChain[0], 10);

    updateCredential(dispatch, credential.credId, {
        accountAddress,
        credentialIndex,
    });
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
    ][] = getCredentialsFromAccountInfo(accountInfo);
    // Find any credentials, which have been removed from the account, remove their (former) index and update their status.
    const removed = localCredentials.filter(
        (cred) =>
            instanceOfDeployedCredential(cred) &&
            !onChainCredentials.some(
                ([onChainCredential]) =>
                    cred.credId === onChainCredential.credId
            )
    );

    for (const cred of removed) {
        await updateCredential(dispatch, cred.credId, {
            credentialIndex: undefined,
            status: CredentialStatus.Removed,
        });
    }

    // Find any local credentials, which have been deployed on the account, attach their index and update their status.
    for (const cred of localCredentials) {
        if (!instanceOfDeployedCredential(cred)) {
            const onChainReference = onChainCredentials.find(
                ([onChainCredential]) =>
                    cred.credId === onChainCredential.credId
            );
            if (onChainReference) {
                const [, credentialIndex] = onChainReference;
                await updateCredential(dispatch, cred.credId, {
                    credentialIndex,
                    status: CredentialStatus.Deployed,
                });
            }
        }
    }
}

export default credentialSlice.reducer;
