import { EncryptedData } from './types';
import { DecryptionData, DecryptionResult } from '~/ipc/crypto';

/**
 * Encrypts the data using PBKDF2 to generate a key from the password, and
 * AES-256 in CBC mode. The cipher text is returned along with the parameters
 * required to decrypt the file.
 */
export async function encrypt(
    data: string,
    password: string
): Promise<EncryptedData> {
    const encryptedResult = window.cryptoMethods.encrypt(data, password);
    return encryptedResult;
}

/**
 * Decrypts the data using the metadata in the file that was given as input
 * and the provided password.
 */
export async function decrypt(
    { cipherText, metadata }: EncryptedData,
    password: string
): Promise<string> {
    const decryptedResult: DecryptionResult = window.cryptoMethods.decrypt(
        { cipherText, metadata },
        password
    );

    if (decryptedResult.error) {
        throw decryptedResult.error;
    } else {
        const decryptedData: DecryptionData = decryptedResult as DecryptionData;
        return decryptedData.data;
    }
}
