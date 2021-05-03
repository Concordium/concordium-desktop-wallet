import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { instanceOfLocalCredential, LocalCredential } from './types';

/**
 * Finds the unique, deployed, credential with the given account address and wallet.
 *
 * This method works on the assumption that there will never be multiple
 * credentials deployed on the same account using the same wallet.
 */
export default async function findLocalDeployedCredential(
    walletId: number,
    accountAddress: string
): Promise<LocalCredential | undefined> {
    if (walletId === undefined) {
        throw new Error('Invalid input. A wallet id has to be supplied');
    }

    const result = (await getCredentialsOfAccount(accountAddress))
        .filter((credential) => credential.credentialIndex !== undefined)
        .filter((credential) => instanceOfLocalCredential(credential))
        .find((credential) => credential.walletId === walletId);

    if (result === undefined || !instanceOfLocalCredential(result)) {
        return undefined;
    }

    return result;
}
