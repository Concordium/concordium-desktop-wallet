/* eslint-disable import/no-mutable-exports */
import waitForPreloadReady from '../utils/preloadReady';

let upsertExternalCredential: typeof window.database.externalCredential.upsertExternalCredential;
let upsertMultipleExternalCredentials: typeof window.database.externalCredential.upsertMultipleExternalCredentials;
let deleteExternalCredentials: typeof window.database.externalCredential.deleteExternalCredentials;
let getAllExternalCredentials: typeof window.database.externalCredential.getAllExternalCredentials;

(async () => {
    await waitForPreloadReady();
    ({
        upsertExternalCredential,
        upsertMultipleExternalCredentials,
        deleteExternalCredentials,
        getAllExternalCredentials
    } = window.database.externalCredential);
})();

export {
    upsertExternalCredential,
    upsertMultipleExternalCredentials,
    deleteExternalCredentials,
    getAllExternalCredentials
};
