/* eslint-disable import/no-mutable-exports */
import { Identity } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

import waitForPreloadReady from '../utils/preloadReady';

export async function getAllIdentities(): Promise<Identity[]> {
    return window.database.general.selectAll(databaseNames.identitiesTable);
}

let getNextIdentityNumber: typeof window.database.identity.getNextIdentityNumber;
let insertIdentity: typeof window.database.identity.insert;
let updateIdentity: typeof window.database.identity.update;
let getIdentitiesForWallet: typeof window.database.identity.getIdentitiesForWallet;
let insertPendingIdentityAndInitialAccount: typeof window.database.identity.insertPendingIdentityAndInitialAccount;
let rejectIdentityAndInitialAccount: typeof window.database.identity.rejectIdentityAndInitialAccount;
let removeIdentityAndInitialAccount: typeof window.database.identity.removeIdentityAndInitialAccount;
let confirmIdentity: typeof window.database.identity.confirmIdentity;

(async () => {
    await waitForPreloadReady();
    ({
        getNextIdentityNumber,
        insert: insertIdentity,
        update: updateIdentity,
        getIdentitiesForWallet,
        insertPendingIdentityAndInitialAccount,
        rejectIdentityAndInitialAccount,
        removeIdentityAndInitialAccount,
        confirmIdentity
    } = window.database.identity);
})();

export {
    getNextIdentityNumber,
    insertIdentity,
    updateIdentity,
    getIdentitiesForWallet,
    insertPendingIdentityAndInitialAccount,
    rejectIdentityAndInitialAccount,
    removeIdentityAndInitialAccount,
    confirmIdentity
};
