import { importIdentity } from '../features/IdentitySlice';
import { importAccount } from '../features/AccountSlice';
import { importAddressBookEntry } from '../features/AddressBookSlice';
import { partition } from './basicHelpers';

const identityFields = ['id', 'name', 'randomness']; // TODO are there any other fields we should check?
const accountFields = [
    'name',
    'address',
    'accountNumber',
    'identityId',
    'credential',
];
const addressBookFields = ['name', 'address', 'note'];

/**
 * Checks whether the entry has a "duplicate" in the given list
 * This is determined by equality of the given fields.
 * If the commonFields parameter is given, the function also checks
 * that there are no shared fields, except for those specified in commonFields.
 * Returns true if the entry is not a duplicate.
 */
function checkDuplicates(entry, list, fields, commonFields = undefined) {
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

export async function importIdentities(
    newIdentities,
    existingIdentities
): Promise<void> {
    const [nonDuplicates, duplicates] = partition(
        newIdentities,
        (newIdentity) =>
            checkDuplicates(newIdentity, existingIdentities, identityFields, [])
    );
    if (nonDuplicates.length > 0) {
        await importIdentity(nonDuplicates);
    }
    return duplicates;
}

export async function importAccounts(
    newAccounts,
    existingAccounts
): Promise<void> {
    const [nonDuplicates, duplicates] = partition(newAccounts, (newAccount) =>
        checkDuplicates(newAccount, existingAccounts, accountFields, [])
    );
    if (nonDuplicates.length > 0) {
        await importAccount(nonDuplicates);
    }
    return duplicates;
}

export async function importEntries(entries, addressBook): Promise<void> {
    const [nonDuplicates, duplicates] = partition(entries, (entry) =>
        checkDuplicates(entry, addressBook, addressBookFields, ['note'])
    );
    if (nonDuplicates.length > 0) {
        await importAddressBookEntry(nonDuplicates);
    }
    return duplicates;
}

interface Validation {
    isValid: boolean;
    reason?: string;
}

// TODO add unit tests
export function validateEncryptedStructure(encryptedData): Validation {
    if (!'cipherText' in encryptedData) {
        return { isValid: false, reason: 'missing cipherText field.' };
    }
    if (!'metaData' in encryptedData) {
        return { isValid: false, reason: 'missing metaData field.' };
    }
    const metaDataFields = [
        'keyLen',
        'iterations',
        'salt',
        'initializationVector',
    ];

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
export function validateImportStructure(data): Validation {
    const fields = ['identities', 'accounts', 'addressBook'];
    const missingField = fields.find((field) => !(field in data));
    if (missingField) {
        return { isValid: false, reason: `missing${missingField} value.` };
    }
    return { isValid: true };
}
