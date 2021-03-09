import { Dispatch, Identity, IdentityStatus } from './types';
import { getIdObject } from './httpRequests';
import { getAccountsOfIdentity } from '../database/AccountDao';
import { confirmIdentity, rejectIdentity } from '../features/IdentitySlice';
import { confirmInitialAccount } from '../features/AccountSlice';
import { isInitialAccount } from './accountHelpers';
import { addToAddressBook } from '../features/AddressBookSlice';
import { getAllIdentities } from '../database/IdentityDao';
import { insertCredential } from '../database/CredentialDao';

/**
 * Listens until, the identityProvider confirms the identity/initial account and returns the identityObject.
 * Then updates the identity/initial account in the database.
 * If not confirmed, the identity will be marked as rejected.
 */
export async function confirmIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityName: string,
    accountName: string,
    location: string
) {
    let token;
    try {
        token = await getIdObject(location);
        if (!token) {
            await rejectIdentity(dispatch, identityName);
        } else {
            const { accountAddress } = token;
            await confirmIdentity(dispatch, identityName, token.identityObject);
            await confirmInitialAccount(
                dispatch,
                accountName,
                accountAddress,
                token.credential
            );
            insertCredential(accountAddress, token.credential, 0);
            addToAddressBook(dispatch, {
                name: accountName,
                address: accountAddress,
                note: `Initial account of ${identityName}`,
                readOnly: true,
            });
        }
    } catch (err) {
        await rejectIdentity(dispatch, identityName);
    }
}

async function findInitialAccount(identity: Identity) {
    const accounts = await getAccountsOfIdentity(identity.id);
    return accounts.find(isInitialAccount);
}

export async function resumeIdentityStatusPolling(
    identity: Identity,
    dispatch: Dispatch
) {
    const { name: identityName, codeUri: location } = identity;
    const initialAccount = await findInitialAccount(identity);
    if (!initialAccount) {
        throw new Error('Unexpected missing initial account.');
    }
    const { name: accountName } = initialAccount;
    return confirmIdentityAndInitialAccount(
        dispatch,
        identityName,
        accountName,
        location
    );
}

export default async function listenForIdentityStatus(dispatch: Dispatch) {
    const identities = await getAllIdentities();
    identities
        .filter((identity) => identity.status === IdentityStatus.Pending)
        .forEach((identity) => resumeIdentityStatusPolling(identity, dispatch));
}
