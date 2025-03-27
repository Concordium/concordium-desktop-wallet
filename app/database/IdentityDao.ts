import { Identity } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

export async function getAllIdentities(): Promise<Identity[]> {
    return window.database.general.selectAll(databaseNames.identitiesTable);
}

export const getNextIdentityNumber: typeof window.database.identity.getNextIdentityNumber = (...args) => window.database.identity.getNextIdentityNumber(...args);
export const insertIdentity: typeof window.database.identity.insert = (...args) => window.database.identity.insert(...args);
export const updateIdentity: typeof window.database.identity.update = (...args) => window.database.identity.update(...args);
export const getIdentitiesForWallet: typeof window.database.identity.getIdentitiesForWallet = (...args) => window.database.identity.getIdentitiesForWallet(...args);
export const insertPendingIdentityAndInitialAccount: typeof window.database.identity.insertPendingIdentityAndInitialAccount = (...args) => window.database.identity.insertPendingIdentityAndInitialAccount(...args);
export const rejectIdentityAndInitialAccount: typeof window.database.identity.rejectIdentityAndInitialAccount = (...args) => window.database.identity.rejectIdentityAndInitialAccount(...args);
export const removeIdentityAndInitialAccount: typeof window.database.identity.removeIdentityAndInitialAccount = (...args) => window.database.identity.removeIdentityAndInitialAccount(...args);
export const confirmIdentity: typeof window.database.identity.confirmIdentity = (...args) => window.database.identity.confirmIdentity(...args);
