import * as crypto from 'crypto';
import { EncryptedData } from './types';

const encryptionMethod = 'aes-256-cbc';
const keyDerivationMethod = 'PBKDF2';
const hashAlgorithm = 'sha256';
const cipherEncoding = 'hex';

/**
 * Encrypts the data using
 * pbkdf2 to generate a key from the password
 * and AES256 in cbc mode.
 * return the ciphertext and the parameters needed
 * to decrypt.
 */
export function encrypt(data: string, password: string): EncryptedData {
    const keyLen = 32;
    const iterations = 10000;
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        keyLen,
        hashAlgorithm
    );
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        encryptionMethod,
        key,
        initializationVector
    );
    let cipherText = cipher.update(data, 'utf8', cipherEncoding);
    cipherText += cipher.final(cipherEncoding);
    return {
        cipherText,
        metaData: {
            keyLen,
            iterations,
            salt: salt.toString('hex'),
            initializationVector: initializationVector.toString('hex'),
            encryptionMethod,
            keyDerivationMethod,
            hashAlgorithm,
        },
    };
}

/**
 * Decrypts the data using
 * pbkdf2 to generate a key from the password
 * and AES256 in cbc mode.
 * First parameter should mirror the output of encrypt.
 * Second parameter must be the same password used
 * during encryption, otherwise the method will fail.
 */
export function decrypt(
    { cipherText, metaData }: EncryptedData,
    password: string
): string {
    const { keyLen, iterations, salt, initializationVector } = metaData;
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt, 'hex'),
        iterations,
        keyLen,
        hashAlgorithm
    );
    const decipher = crypto.createDecipheriv(
        encryptionMethod,
        key,
        Buffer.from(initializationVector, 'hex')
    );
    let data = decipher.update(cipherText, cipherEncoding, 'utf8');
    data += decipher.final('utf8');
    return data;
}
