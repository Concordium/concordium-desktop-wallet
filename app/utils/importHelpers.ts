import { EncryptedData, ExportData } from './types';

/**
 * Checks whether the entry has a "duplicate" in the given list
 * This is determined by equality of the given fields.
 * If the commonFields parameter is given, the function also checks
 * that there are no shared fields, except for those specified in commonFields.
 * Returns true if the entry is not a duplicate.
 */
export function checkDuplicates<T>(
    entry: T,
    list: T[],
    fields: (keyof T)[],
    commonFields: (keyof T)[] | undefined = undefined
) {
    const allEqual = list.find((listElement) =>
        fields
            .map((field) => listElement[field] === entry[field])
            .every(Boolean)
    );

    if (allEqual) {
        return false;
    }

    if (commonFields === undefined) {
        return true;
    }

    const anyEqual = list.find((listElement) =>
        fields
            .filter((field) => !commonFields.includes(field))
            .map((field) => listElement[field] === entry[field])
            .some(Boolean)
    );

    if (anyEqual) {
        throw new Error('disallowed'); // TODO use custom error
    }

    // TODO inform of commonField collision.

    return true;
}

interface Validation {
    isValid: boolean;
    reason?: string;
}

// TODO add unit tests
export function validateEncryptedStructure(
    encryptedData: EncryptedData
): Validation {
    if (!encryptedData.cipherText) {
        return { isValid: false, reason: 'missing cipherText field.' };
    }
    if (!encryptedData.metaData) {
        return { isValid: false, reason: 'missing metaData field.' };
    }
    const metaDataFields = [
        'keyLen',
        'iterations',
        'salt',
        'initializationVector',
        'encryptionMethod',
        'keyDerivationMethod',
        'hashAlgorithm',
    ];

    // Check that metaData is an object, so we don't crash when checking it's fields.
    if (typeof encryptedData.metaData !== 'object') {
        return { isValid: false, reason: 'malformed metaData.' };
    }

    const missingField = metaDataFields.find(
        (field) => !(field in encryptedData.metaData)
    );
    if (missingField) {
        return {
            isValid: false,
            reason: `missing metadata.${missingField} value.`,
        };
    }
    return { isValid: true };
}

// TODO add unit tests
export function validateImportStructure(data: ExportData): Validation {
    const fields = ['identities', 'accounts', 'addressBook'];

    // Check that data is an object, so we don't crash when checking it's fields.
    if (typeof data !== 'object') {
        return { isValid: false, reason: 'malformed data.' };
    }

    const missingField = fields.find((field) => !(field in data));
    if (missingField) {
        return { isValid: false, reason: `missing${missingField} value.` };
    }
    return { isValid: true };
}

export function validatePassword(password: string) {
    return password.length >= 6;
}
