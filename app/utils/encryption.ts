import { EncryptedData } from './types';
import { DecryptionData, DecryptionResult } from '~/preload/preloadTypes';

/**
 * Encrypts the data using PBKDF2 to generate a key from the password, and
 * AES-256 in CBC mode. The cipher text is returned along with the parameters
 * required to decrypt the file.
 */
export function encrypt(data: string, password: string): EncryptedData {
    const encryptedResult = window.cryptoMethods.encrypt(data, password);
    return encryptedResult;
}

/**
 * Decrypts the data using the metadata in the file that was given as input
 * and the provided password.
 */
export function decrypt(
    { cipherText, metadata }: EncryptedData,
    password: string
): string {
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
