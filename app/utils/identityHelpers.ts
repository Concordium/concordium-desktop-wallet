import { formatDate } from './timeHelpers';
import {
    Identity,
    ChosenAttributes,
    AttributeKey,
    AttributeKeyName,
    PendingIdentity,
    IdentityStatus,
    ConfirmedIdentity,
    RecoveredIdentity,
    RejectedIdentity,
    IdentityVersion,
    BlsKeyTypes,
} from './types';

// Version that current identities are created with.
export const currentIdentityVersion: IdentityVersion = 1;

export const IDENTITY_NAME_MAX_LENGTH = 25;

export const attributeNamesMap: {
    [P in AttributeKeyName]: string;
} = {
    countryOfResidence: 'Country of residence',
    firstName: 'First name',
    idDocExpiresAt: 'ID valid to',
    idDocIssuedAt: 'ID valid from',
    idDocIssuer: ' Identity document issuer',
    idDocType: 'Identity document type',
    idDocNo: ' Identity document number',
    lastName: 'Last name',
    taxIdNo: 'Tax ID number',
    nationalIdNo: 'National ID number',
    nationality: 'Country of nationality',
    sex: 'Sex',
    dob: 'Date of birth',
};

enum Sex {
    NotKnown,
    Male,
    Female,
    NA = 9,
}

const parseGender = (sex: Sex) => {
    switch (sex) {
        case Sex.NotKnown:
            return 'Not known';
        case Sex.Male:
            return 'Male';
        case Sex.Female:
            return 'Female';
        default:
            return 'N/A';
    }
};

enum DocumentType {
    NA,
    Passport,
    NationalIdCard,
    DriversLicense,
    ImmigrationCard,
}

const parseDocType = (docType: DocumentType) => {
    switch (docType) {
        case DocumentType.NationalIdCard:
            return 'National ID card';
        case DocumentType.Passport:
            return 'Passport';
        case DocumentType.DriversLicense:
            return 'Drivers license';
        case DocumentType.ImmigrationCard:
            return 'Immigration card';
        default:
            return 'N/A';
    }
};

const parseDate = (date: string) => {
    try {
        return formatDate(date);
    } catch {
        return 'N/A';
    }
};

export function formatAttributeValue(
    key: AttributeKeyName,
    value: ChosenAttributes[typeof key]
): string;
export function formatAttributeValue(key: string, value: string): string {
    switch (key) {
        case 'idDocExpiresAt':
        case 'idDocIssuedAt':
        case 'dob':
            return parseDate(value);
        case 'sex':
            return parseGender(parseInt(value, 10));
        case 'idDocType':
            return parseDocType(parseInt(value, 10));
        default:
            return value;
    }
}

/**
 * Compare two attribute key names.
 * Tags, that are not in AttributeKey, are considered larger than those in AttributeKey.
 * This is to ensure that in a sorted ascending list, unknown attributes are placed at the end of the list.
 */
export function compareAttributes(
    attributeTag1: AttributeKeyName | string,
    attributeTag2: AttributeKeyName | string
) {
    const attr1 = AttributeKey[attributeTag1 as AttributeKeyName];
    const attr2 = AttributeKey[attributeTag2 as AttributeKeyName];
    if (attr1 === undefined && attr2 === undefined) {
        return attributeTag1.localeCompare(attributeTag2);
    }
    if (attr1 === undefined) {
        return 1;
    }
    if (attr2 === undefined) {
        return -1;
    }
    return attr1 - attr2;
}

export function getSessionId(
    identity: PendingIdentity | RejectedIdentity | ConfirmedIdentity
) {
    const hash = window.cryptoMethods.sha256([identity.codeUri]);
    return Buffer.from(hash).toString('hex');
}

export function isConfirmedIdentity(
    identity: Identity
): identity is ConfirmedIdentity {
    return identity.status === IdentityStatus.Confirmed;
}

export function isPendingIdentity(
    identity: Identity
): identity is PendingIdentity {
    return identity.status === IdentityStatus.Pending;
}

export function isRecoveredIdentity(
    identity: Identity
): identity is RecoveredIdentity {
    return (
        identity.status === IdentityStatus.Recovered ||
        identity.status === IdentityStatus.Genesis
    );
}

export function isRejectedIdentity(
    identity: Identity
): identity is RejectedIdentity {
    return (
        identity.status === IdentityStatus.Rejected ||
        identity.status === IdentityStatus.RejectedAndWarned
    );
}

/**
 * Given an IdentityVersion, returns which Bls Key type should be requested from the ledger.
 * Version 0 should request seeds (because the ledger does not implement the incorrect key generation algorithm) and version 1 should request actual Bls keys.
 */
export function getKeyExportType(version: IdentityVersion): BlsKeyTypes {
    if (version === 0) {
        return BlsKeyTypes.Seed;
    }
    return BlsKeyTypes.Key;
}
