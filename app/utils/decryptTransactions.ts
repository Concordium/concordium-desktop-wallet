import { decryptAmounts } from './rustInterface';
import {
    Global,
    TransferTransaction,
    IdentityVersion,
    DecryptedTransferTransaction,
} from './types';

/**
 * Decrypts the encrypted transfers in the provided transaction list. This is
 * done by using the provided PRF key, which has to belong to the corresponding
 * receiver account.
 *
 * Note: If the PRF key and account mismatches, then this method
 * will run indefinitely.
 * @param encryptedTransfers the encrypted transfers to decrypt
 * @param accountAddress the account that the transactions are for
 * @param prfKey the PRF key that matches the account
 * @param credentialNumber the credential number to decrypt for
 * @param global the global cryptographic parameters for the chain
 */
export default async function decryptTransactions(
    encryptedTransfers: TransferTransaction[],
    accountAddress: string,
    prfKey: string,
    identityVersion: IdentityVersion,
    credentialNumber: number,
    global: Global
): Promise<DecryptedTransferTransaction[]> {
    // Gather all the encrypted amounts, so that we can decrypt them in one go. We want to batch it
    // as there is a significant performance hit if we decrypt one at a time.
    const encryptedAmountForDecryption = [];
    for (const encryptedTransfer of encryptedTransfers) {
        if (!encryptedTransfer.encrypted) {
            throw new Error(
                `One of the provided transfers did not contain an encrypted amount: ${encryptedTransfer.transactionHash}`
            );
        }

        if (encryptedTransfer.fromAddress === accountAddress) {
            encryptedAmountForDecryption.push(
                JSON.parse(encryptedTransfer.encrypted).inputEncryptedAmount
            );
            encryptedAmountForDecryption.push(
                JSON.parse(encryptedTransfer.encrypted).newSelfEncryptedAmount
            );
        } else {
            encryptedAmountForDecryption.push(
                JSON.parse(encryptedTransfer.encrypted).encryptedAmount
            );
        }
    }

    const decryptedAmounts = await decryptAmounts(
        encryptedAmountForDecryption,
        credentialNumber,
        global,
        prfKey,
        identityVersion
    );

    let offset = 0;
    return encryptedTransfers.map((transaction, index) => {
        if (transaction.fromAddress === accountAddress) {
            const amount =
                BigInt(decryptedAmounts[index + offset]) -
                BigInt(decryptedAmounts[index + offset + 1]);
            offset += 1;
            return {
                ...transaction,
                decryptedAmount: amount.toString(),
            };
        }
        return {
            ...transaction,
            decryptedAmount: decryptedAmounts[index + offset],
        };
    });
}
