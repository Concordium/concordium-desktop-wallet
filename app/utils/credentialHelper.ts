import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { getId } from '~/database/WalletDao';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import { getAccountInfo } from '~/node/nodeRequests';
import {
    AccountInfo,
    Credential,
    CredentialDeploymentInformation,
    CredentialStatus,
    CredentialWithIdentityNumber,
    DeployedCredential,
    Identity,
    instanceOfDeployedCredential,
} from './types';

/**
 * Finds the unique, deployed, credential with the given account address and walletId.
 *
 * This method works on the assumption that there will never be multiple
 * credentials deployed on the same account using the same wallet.
 */
export async function findLocalDeployedCredential(
    walletId: number,
    accountAddress: string
): Promise<(CredentialWithIdentityNumber & DeployedCredential) | undefined> {
    if (walletId === undefined) {
        throw new Error('Invalid input. A wallet id has to be supplied');
    }

    const credentialsOfAccount = await getCredentialsOfAccount(accountAddress);
    const result = credentialsOfAccount
        .filter(instanceOfDeployedCredential)
        .find((credential) => credential.walletId === walletId);

    if (result === undefined || !instanceOfDeployedCredential(result)) {
        return undefined;
    }

    return result;
}

/**
 * Finds the unique, deployed, credential for the given account address for the
 * currently connected (hardware) wallet.
 * @returns the unique credential for the given account and wallet, if no match is found, then undefined is returned
 */
export default async function findLocalDeployedCredentialWithWallet(
    accountAddress: string,
    ledger: ConcordiumLedgerClient
): Promise<(CredentialWithIdentityNumber & DeployedCredential) | undefined> {
    const walletIdentifier = await ledger.getPublicKeySilent(getPairingPath());
    const walletId = await getId(walletIdentifier.toString('hex'));
    if (walletId === undefined) {
        return undefined;
    }
    return findLocalDeployedCredential(walletId, accountAddress);
}

export const CREDENTIAL_NOTE_MAX_LENGTH = 100;

export function getNoteForOwnCredential(
    identities: Identity[],
    ownCred: Credential | undefined
): string | undefined {
    const identityName = identities.find((i) => i.id === ownCred?.identityId)
        ?.name;

    if (!identityName) {
        return undefined;
    }

    return `Credential from "${identityName}"`;
}

/**
 * Given an AccountInfo, extracts the list of credentials on the account, and their indices.
 * @return [CredentialDeploymentInformation, credentialIndex][]
 */
export function getCredentialsFromAccountInfo(
    accountInfo: AccountInfo
): [CredentialDeploymentInformation, number][] {
    return Object.entries(accountInfo.accountCredentials).map(
        ([index, versioned]) => {
            const { regId, credId, ...content } = versioned.value.contents;
            return [
                { ...content, credId: regId || credId },
                parseInt(index, 10),
            ];
        }
    );
}

/**
 * Determines the status and index of the given credId, at the time of the given blockHash.
 */
export async function getCredentialStatusAndIndex(
    credId: string,
    blockHash: string
): Promise<Pick<Credential, 'status' | 'credentialIndex'>> {
    const info = await getAccountInfo(credId, blockHash);
    if (!info) {
        return { status: CredentialStatus.Pending, credentialIndex: undefined };
    }
    const creds = getCredentialsFromAccountInfo(info);
    const match = creds.find(([cred]) => cred.credId === credId);
    if (match) {
        return { status: CredentialStatus.Deployed, credentialIndex: match[1] };
    }
    return { status: CredentialStatus.Removed, credentialIndex: undefined };
}
