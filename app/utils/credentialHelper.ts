import {
    InitialAccountCredential,
    NormalAccountCredential,
    Versioned,
} from '@concordium/node-sdk';
import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { getWalletId } from '~/database/WalletDao';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import {
    Policy,
    Credential,
    CredentialWithIdentityNumber,
    DeployedCredential,
    Identity,
    instanceOfCredentialWithIdentityNumber,
    instanceOfDeployedCredential,
    CommitmentsRandomness,
} from './types';

export async function hasFirstCredential(
    accountAddress: string
): Promise<boolean> {
    const credentialsOfAccount = await getCredentialsOfAccount(accountAddress);
    return credentialsOfAccount.some(
        (credential) => credential.credentialIndex === 0
    );
}

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
        .filter(instanceOfCredentialWithIdentityNumber)
        .find((credential) => credential.walletId === walletId);

    if (
        result === undefined ||
        !instanceOfDeployedCredential(result) ||
        !instanceOfCredentialWithIdentityNumber(result)
    ) {
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
    const walletId = await getWalletId(walletIdentifier.toString('hex'));
    if (walletId === undefined) {
        return undefined;
    }
    return findLocalDeployedCredential(walletId, accountAddress);
}

export function createNewCredential(
    accountAddress: string,
    credentialNumber: number,
    identityId: number,
    credentialIndex: number | undefined,
    credId: string,
    policy: Policy,
    randomness?: CommitmentsRandomness
) {
    return {
        credId,
        policy: JSON.stringify(policy),
        accountAddress,
        credentialNumber,
        identityId,
        credentialIndex,
        randomness: randomness ? JSON.stringify(randomness) : undefined,
    };
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
 * Given a versioned credential, returns the credId.
 */
export function getCredId(
    cred: Versioned<InitialAccountCredential | NormalAccountCredential>
) {
    if (cred.v !== 0) {
        throw new Error('Unsupported credential version');
    }
    return cred.value.type === 'initial'
        ? cred.value.contents.regId
        : cred.value.contents.credId;
}
