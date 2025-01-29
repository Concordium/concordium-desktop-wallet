/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto';
import { Buffer } from 'buffer/';
import { CryptoMethods } from '~/preload/preloadTypes';
import { throwLoggedError } from '~/utils/basicHelpers';
import { EncryptedData } from '~/utils/types';

const encoding = 'base64';

const aes256EncryptionMethodExternal = 'AES-256';
const aes256EncryptionMethod = 'AES-256-CBC';

const PBKDF2keyDerivationMethodExternal = 'PBKDF2WithHmacSHA256';
const PBKDF2keyDerivationMethod = 'PBKDF2';

const hashAlgorithmInternal = 'sha256';

const defaultKeyLength = 32;

/**
 * The naming of the encryption methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getEncryptionMethodExport(method: string) {
    if (method === aes256EncryptionMethod) {
        return aes256EncryptionMethodExternal;
    }
    return throwLoggedError(
        `An unsupported encryption method was used: ${method}`
    );
}

function getEncryptionMethodImport(method: string) {
    if (method === aes256EncryptionMethodExternal) {
        return aes256EncryptionMethod;
    }
    return throwLoggedError(
        `An unsupported encryption method was used: " ${method}`
    );
}

function checkKeyDerivationMethodImport(method: string) {
    if (method !== PBKDF2keyDerivationMethodExternal) {
        throw new Error(
            `An unsupported key derivation method was used: " ${method}`
        );
    }
}

/**
 * The naming of the key derivation methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getKeyDerivationAlgorithmExport(algorithm: string) {
    if (algorithm === PBKDF2keyDerivationMethod) {
        return PBKDF2keyDerivationMethodExternal;
    }
    return throwLoggedError(
        `An unsupported key derivation algorithm was used: ${algorithm}`
    );
}

/**
 * Encrypts the data using PBKDF2 to generate a key from the password, and
 * AES-256 in CBC mode. The cipher text is returned along with the parameters
 * required to decrypt the file.
 */
export function encrypt(data: string, password: string): EncryptedData {
    const keyLen = defaultKeyLength;
    const iterations = 10000;
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(
        password,
        new Uint8Array(salt),
        iterations,
        keyLen,
        hashAlgorithmInternal
    );
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        aes256EncryptionMethod,
        new Uint8Array(key),
        new Uint8Array(initializationVector)
    );
    let cipherText = cipher.update(data, 'utf8', encoding);
    cipherText += cipher.final(encoding);
    return {
        cipherText,
        metadata: {
            keyLen,
            iterations,
            salt: salt.toString(encoding),
            initializationVector: initializationVector.toString(encoding),
            encryptionMethod: getEncryptionMethodExport(aes256EncryptionMethod),
            keyDerivationMethod: getKeyDerivationAlgorithmExport(
                PBKDF2keyDerivationMethod
            ),
            hashAlgorithm: hashAlgorithmInternal,
        },
    };
}

/**
 * Decrypts the data using the metadata in the file that was given as input
 * and the provided password.
 */
export function decrypt(
    { cipherText, metadata }: EncryptedData,
    password: string
): string {
    const {
        keyLen,
        iterations,
        salt,
        initializationVector,
        encryptionMethod,
        hashAlgorithm,
        keyDerivationMethod,
    } = metadata;

    checkKeyDerivationMethodImport(keyDerivationMethod);
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt, encoding),
        iterations,
        keyLen || defaultKeyLength,
        hashAlgorithm || hashAlgorithmInternal
    );

    const internalEncryptionMethod = getEncryptionMethodImport(
        encryptionMethod
    );
    const decipher = crypto.createDecipheriv(
        internalEncryptionMethod,
        new Uint8Array(key),
        Buffer.from(initializationVector, encoding)
    );
    let data = decipher.update(cipherText, encoding, 'utf8');
    data += decipher.final('utf8');
    return data;
}

function hashSha256(data: (string | Buffer | Uint8Array)[]) {
    const hash = crypto.createHash('sha256');
    data.forEach((input) => hash.update(input));
    return Buffer.from(new Uint8Array(hash.digest()));
}

const exposedMethods: CryptoMethods = {
    encrypt,
    decrypt: ({ cipherText, metadata }: EncryptedData, password: string) => {
        try {
            return { data: decrypt({ cipherText, metadata }, password) };
        } catch (e) {
            return { error: e };
        }
    },
    sha256: hashSha256,
};
export default exposedMethods;
