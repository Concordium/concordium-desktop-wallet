import { Identity } from '../utils/types';
import { identitiesTable } from '../constants/databaseNames.json';

export async function getAllIdentities(): Promise<Identity[]> {
    return window.database.general.selectAll(identitiesTable);
}

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
