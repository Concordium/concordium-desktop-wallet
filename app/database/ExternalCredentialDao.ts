import waitForPreloadReady from '../utils/preloadReady';

await waitForPreloadReady();

export const {
    upsertExternalCredential,
    upsertMultipleExternalCredentials,
    deleteExternalCredentials,
    getAllExternalCredentials,
} = window.database.externalCredential;
