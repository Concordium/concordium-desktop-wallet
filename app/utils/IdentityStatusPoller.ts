import { Dispatch, Identity, IdentityStatus } from './types';
import { getIdObject } from './httpRequests';
import { getAccountsOfIdentity } from '../database/AccountDao';
import { confirmIdentity, rejectIdentity } from '../features/IdentitySlice';
import {
    confirmInitialAccount,
    removeInitialAccount,
} from '../features/AccountSlice';
import { isInitialAccount } from './accountHelpers';
import { addToAddressBook } from '../features/AddressBookSlice';
import { getAllIdentities } from '../database/IdentityDao';
import { insertNewCredential } from '../features/CredentialSlice';

/**
 * Poll the identity provider for an identity until the identity and initial account either
 * are confirmed as being created, or until the identity provider returns an error for the
 * identity creation. If confirmed the identity object is received and used to update
 * the identity and initial account in the database, and if failed then the identity is
 * marked as rejected.
 */
export async function confirmIdentityAndInitialAccount(
    dispatch: Dispatch,
    identityName: string,
    identityId: number,
    accountName: string,
    location: string
) {
    const idObjectResponse = await getIdObject(location);

    if (idObjectResponse.error) {
        await rejectIdentity(dispatch, identityId);
        await removeInitialAccount(dispatch, identityId);
        return;
    }

    // An identity object was received, so the identity has been created
    // by the provider. Update the corresponding state in the database.
    const { token } = idObjectResponse;
    const { accountAddress } = token;
    const credential = token.credential.value.credential.contents;
    const parsedCredential = {
        credId: credential.credId || credential.regId,
        policy: credential.policy,
    };
    await confirmIdentity(dispatch, identityId, token.identityObject);
    await confirmInitialAccount(dispatch, identityId, accountAddress);
    insertNewCredential(
        dispatch,
        accountAddress,
        0,
        identityId,
        0, // credentialIndex = 0 on original
        parsedCredential
    );
    addToAddressBook(dispatch, {
        name: accountName,
        address: accountAddress,
        note: `Initial account of identity: ${identityName}`,
        readOnly: true,
    });
}

async function findInitialAccount(identity: Identity) {
    const accounts = await getAccountsOfIdentity(identity.id);
    return accounts.find(isInitialAccount);
}

export async function resumeIdentityStatusPolling(
    identity: Identity,
    dispatch: Dispatch
) {
    const { name: identityName, codeUri: location, id } = identity;
    const initialAccount = await findInitialAccount(identity);
    if (!initialAccount) {
        throw new Error('Unexpected missing initial account.');
    }
    const { name: accountName } = initialAccount;
    return confirmIdentityAndInitialAccount(
        dispatch,
        identityName,
        id,
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
