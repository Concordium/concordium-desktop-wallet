import { decryptAmounts } from './rustInterface';
import { Global, TransferTransaction } from './types';

/**
 * Decrypts the encrypted transfers in the provided transaction list. This is
 * done by using the provided PRF key, which has to belong to the corresponding
 * receiver account.
 *
 * Note: If the PRF key and account mismatches, then this method
 * will run indefinitely.
 * @param encryptedTransfers the encrypted transfers to decrypt
 * @param the account that the transactions are for
 * @param prfKey the PRF key that matches the account
 * @param credentialNumber the credential number to decrypt for
 * @param global the global cryptographic parameters for the chain
 */
export default async function decryptTransactions(
    encryptedTransfers: TransferTransaction[],
    accountAddress: string,
    prfKey: string,
    credentialNumber: number,
    global: Global
) {
    const encryptedAmounts = encryptedTransfers.map((t) => {
        if (!t.encrypted) {
            throw new Error(
                `One of the provided transfers did not contain an encrypted amount: ${t.transactionHash}`
            );
        } else if (t.fromAddress === accountAddress) {
            return JSON.parse(t.encrypted).inputEncryptedAmount;
        }
        return JSON.parse(t.encrypted).encryptedAmount;
    });

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        credentialNumber,
        global,
        prfKey
    );

    return encryptedTransfers.map((transaction, index) => {
        return {
            ...transaction,
            decryptedAmount: decryptedAmounts[index],
        };
    });
}
