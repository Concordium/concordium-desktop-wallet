import * as crypto from 'crypto';

// TODO add unit tests to ensure correctness of methods.

/**
 * Encrypts the data using
 * pbkdf2 to generate a key from the password
 * and AES256 in cbc mode.
 * return the ciphertext and the parameters needed
 * to decrypt.
 */
export function encrypt(data, password) {
    // TODO: ensure this is correct.
    const keyLen = 32;
    const iterations = 10000;
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha256');
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        key,
        initializationVector
    );
    let cipherText = cipher.update(data, 'utf8', 'hex');
    cipherText += cipher.final('hex');
    return {
        cipherText,
        metaData: {
            keyLen,
            iterations,
            salt,
            initializationVector,
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
export function decrypt({ cipherText, metaData }, password) {
    // TODO: ensure this is correct.
    const { keyLen, iterations, salt, initializationVector } = metaData;
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt),
        iterations,
        keyLen,
        'sha256'
    );
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        key,
        Buffer.from(initializationVector)
    );
    let data = decipher.update(cipherText, 'hex', 'utf8');
    data += decipher.final('utf8');
    return data;
}
