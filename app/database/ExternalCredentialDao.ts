import { MakeOptional } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';
import { ExternalCredential } from './types';

export async function upsertExternalCredential(
    credential: MakeOptional<ExternalCredential, 'note'>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.externalCredentials.upsertExternalCredential,
        credential
    );
}

export async function upsertMultipleExternalCredentials(
    credentials: MakeOptional<ExternalCredential, 'note'>[]
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.externalCredentials
            .upsertMultipleExternalCredentials,
        credentials
    );
}

export async function deleteExternalCredentials(credIds: string[]) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.externalCredentials.deleteExternalCredentials,
        credIds
    );
}

export async function getAllExternalCredentials(): Promise<
    ExternalCredential[]
> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.externalCredentials.getAllExternalCredentials
    );
}
