/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto';
import { IpcMain } from 'electron';
import { EncryptedData } from '~/utils/types';
import ipcCommands from '../constants/ipcCommands.json';

export interface DecryptionData {
    data: string;
    error?: never;
}
interface DecryptionError {
    data?: never;
    error: any;
}
export type DecryptionResult = DecryptionData | DecryptionError;

const encoding = 'base64';

const aes256EncryptionMethodExternal = 'AES-256';
const aes256EncryptionMethod = 'AES-256-CBC';

const keyDerivationMethodExternal = 'PBKDF2WithHmacSHA256';
const keyDerivationMethod = 'PBKDF2';

const hashAlgorithmInternal = 'sha256';

/**
 * The naming of the encryption methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getEncryptionMethodExport(method: string) {
    if (method === aes256EncryptionMethod) {
        return aes256EncryptionMethodExternal;
    }
    throw new Error(`An unsupported encryption method was used: ${method}`);
}

function getEncryptionMethodImport(method: string) {
    if (method === aes256EncryptionMethodExternal) {
        return aes256EncryptionMethod;
    }
    throw new Error(`An unsupported encryption method was used: " ${method}`);
}

/**
 * The naming of the key derivation methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getKeyDerivationAlgorithmExport(algorithm: string) {
    if (algorithm === keyDerivationMethod) {
        return keyDerivationMethodExternal;
    }
    throw new Error(
        `An unsupported key derivation algorithm was used: ${algorithm}`
    );
}

/**
 * Encrypts the data using PBKDF2 to generate a key from the password, and
 * AES-256 in CBC mode. The cipher text is returned along with the parameters
 * required to decrypt the file.
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
        hashAlgorithmInternal
    );
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        aes256EncryptionMethod,
        key,
        initializationVector
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
                keyDerivationMethod
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
    } = metadata;
    const internalEncryptionMethod = getEncryptionMethodImport(
        encryptionMethod
    );
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt, encoding),
        iterations,
        keyLen,
        hashAlgorithm
    );
    const decipher = crypto.createDecipheriv(
        internalEncryptionMethod,
        key,
        Buffer.from(initializationVector, encoding)
    );
    let data = decipher.update(cipherText, encoding, 'utf8');
    data += decipher.final('utf8');
    return data;
}

async function hashSha256(data: (Buffer | Uint8Array)[]) {
    const hash = crypto.createHash('sha256');
    data.forEach((input) => hash.update(input));
    return hash.digest();
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.encrypt,
        (_event, data: string, password: string) => {
            return encrypt(data, password);
        }
    );

    ipcMain.handle(
        ipcCommands.decrypt,
        (_event, { cipherText, metadata }: EncryptedData, password: string) => {
            try {
                return { data: decrypt({ cipherText, metadata }, password) };
            } catch (e) {
                return { error: e };
            }
        }
    );

    ipcMain.handle(
        ipcCommands.sha256,
        async (_event, data: (Buffer | Uint8Array)[]) => {
            return hashSha256(data);
        }
    );
}
