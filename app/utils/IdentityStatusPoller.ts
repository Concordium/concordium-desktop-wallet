import { Dispatch, PendingIdentity } from './types';
import { getIdObject } from './httpRequests';
import { loadIdentities } from '../features/IdentitySlice';
import { loadAccounts } from '../features/AccountSlice';
import { isPendingIdentity } from './identityHelpers';
import {
    confirmIdentity,
    getAllIdentities,
    rejectIdentity,
} from '../database/IdentityDao';
import { loadCredentials } from '~/features/CredentialSlice';
import { loadAddressBook } from '~/features/AddressBookSlice';

/**
 * Poll the identity provider for an identity until the identity and initial account either
 * are confirmed as being created, or until the identity provider returns an error for the
 * identity creation. If confirmed the identity object is received and used to update
 * the identity and initial account in the database, and if failed then the identity is
 * marked as rejected.
 */
export async function confirmIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityId: number,
    location: string
): Promise<void> {
    const idObjectResponse = await getIdObject(location);

    // The identity provider failed the identity creation request. Clean up the
    // identity and account in the database and refresh the state.
    if (idObjectResponse.error) {
        window.log.info(
            `Identity Issuance failed, reason: ${idObjectResponse.error.message}`
        );
        await rejectIdentity(identityId, idObjectResponse.error.message);
        await loadIdentities(dispatch);
        return;
    }

    // An identity object was received, so the identity has been created
    // by the provider. Update the corresponding state in the database.
    const { token } = idObjectResponse;

    window.log.info(`Identity Issuance Successful`);
    await confirmIdentity(identityId, JSON.stringify(token.identityObject));
    // Update the state with the changes made in the database.
    loadIdentities(dispatch);
    loadAccounts(dispatch);
    loadCredentials(dispatch);
    loadAddressBook(dispatch);
}

export async function resumeIdentityStatusPolling(
    identity: PendingIdentity,
    dispatch: Dispatch
) {
    const { codeUri: location, id } = identity;
    return confirmIdentityAndInitialAccount(dispatch, id, location);
}

export default async function listenForIdentityStatus(dispatch: Dispatch) {
    const identities = await getAllIdentities();
    identities
        .filter(isPendingIdentity)
        .forEach((identity) => resumeIdentityStatusPolling(identity, dispatch));
}
