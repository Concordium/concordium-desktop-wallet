import { Identity } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

import waitForPreloadReady from "../utils/preloadReady";

export async function getAllIdentities(): Promise<Identity[]> {
    return window.database.general.selectAll(databaseNames.identitiesTable);
}

await waitForPreloadReady();
export const {
    getNextIdentityNumber,
    insert: insertIdentity,
    update: updateIdentity,
    getIdentitiesForWallet,
    insertPendingIdentityAndInitialAccount,
    rejectIdentityAndInitialAccount,
    removeIdentityAndInitialAccount,
    confirmIdentity,
} = window.database.identity;
