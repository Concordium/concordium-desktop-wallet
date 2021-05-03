import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { getId } from '~/database/WalletDao';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import {
    DeployedCredential,
    instanceOfDeployedCredential,
    instanceOfLocalCredential,
    LocalCredential,
} from './types';

/**
 * Finds the unique, deployed, credential with the given account address and walletId.
 *
 * This method works on the assumption that there will never be multiple
 * credentials deployed on the same account using the same wallet.
 */
async function findLocalDeployedCredential(
    walletId: number,
    accountAddress: string
): Promise<(LocalCredential & DeployedCredential) | undefined> {
    if (walletId === undefined) {
        throw new Error('Invalid input. A wallet id has to be supplied');
    }

    const result = (await getCredentialsOfAccount(accountAddress))
        .filter((credential) => instanceOfLocalCredential(credential))
        .filter((credential) => instanceOfDeployedCredential(credential))
        .find((credential) => credential.walletId === walletId);

    if (
        result === undefined ||
        !instanceOfLocalCredential(result) ||
        !instanceOfDeployedCredential(result)
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
): Promise<(LocalCredential & DeployedCredential) | undefined> {
    const walletIdentifier = await ledger.getPublicKeySilent(getPairingPath());
    const walletId = await getId(walletIdentifier.toString('hex'));
    return findLocalDeployedCredential(walletId, accountAddress);
}
