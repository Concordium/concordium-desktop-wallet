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
} from './types';

export const currentIdentityVersion = 1;

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

export const formatAttributeValue = (
    key: AttributeKeyName,
    value: ChosenAttributes[typeof key]
): string => {
    switch (key) {
        case 'idDocExpiresAt':
        case 'idDocIssuedAt':
        case 'dob':
            return formatDate(value);
        case 'sex':
            return parseGender(parseInt(value, 10));
        case 'idDocType':
            return parseDocType(parseInt(value, 10));
        default:
            return value;
    }
};

export function compareAttributes(
    AttributeTag1: AttributeKeyName,
    AttributeTag2: AttributeKeyName
) {
    return AttributeKey[AttributeTag1] - AttributeKey[AttributeTag2];
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
