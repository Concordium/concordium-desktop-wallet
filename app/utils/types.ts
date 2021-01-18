import { AccountAddress } from '../proto/api_pb';

export interface Versioned<T> {
    v: number;
    value: T;
}

export interface IdentityObject {
    attributeList: AttributeList;
    // TODO Implement all the other fields when needed.
}

export interface AttributeList {
    createdAt: string;
    validTo: string;
    maxAccounts: number;
    chosenAttributes: ChosenAttributes;
}

export interface ChosenAttributes {
    countryOfResidence: string;
    dob: string;
    firstName: string;
    idDocExpiresAt: string;
    idDocIsseudAt: string;
    idDocIssuer: string;
    idDocNo: string;
    idDocType: string;
    lastName: string;
    nationalIdNo: string;
    nationality: string;
    sex: number;
    taxIdNo: string;
}

export interface Identity {
    id: number;
    name: string;
    identityObject: string;
}

export interface AccountTransaction {
    sender: AccountAddress;
    nonce: number;
    energyAmount: number;
    expiry: number;
    transactionKind: TransactionKind;
    payload;
}

export enum TransactionKind {
    Deploy_module = 0,
    Initialize_smart_contract_instance = 1,
    Update_smart_contract_instance = 2,
    Simple_transfer = 3,
    Add_baker = 4,
    Remove_baker = 5,
    Update_baker_account = 6,
    Update_baker_sign_key = 7,
    Delegate_stake = 8,
    Undelegate_stake = 9,
    Transfer_with_schedule = 19,
} // TODO: Add all kinds (11- 18)

export enum BlockItemKind {
    AccountTransactionKind = 0,
    CredentialDeploymentKind = 1,
    UpdateInstructionKind = 2,
}

type AccountCredentialWithProofs =
    | InitialCredentialDeploymentInfo
    | CredentialDeploymentInformation;

interface InitialCredentialDeploymentInfo {
    icdiValues: InitialCredentialDeploymentValues;
    signature: IpCdiSignature;
}

interface InitialCredentialDeploymentValues {
    account: InitialCredentialAccount;
    regId: CredentialRegistrationID;
    ipId: IdentityProviderIdentity;
    policy: Policy;
}

interface CredentialDeploymentInformation {
    values: CredentialDeploymentValues;
    proofs: Proofs;
}

interface CredentialDeploymentValues {
    account: CredentialAccount;
    regId: CredentialRegistrationID;
    ipId: IdentityProviderIdentity;
    revocationThreshold: Threshold;
    arData; // Map AnonymityRevocationDat,
    policy: Policy;
}

interface InitialCredentialAccount {
    keys: AccountVerificationKey[]; //
    threshhold: SignatureThreshold;
}

type SignatureThreshold = number; // word8
type AccountVerificationKey = Uint8Array;

type CredentialAccount = AccountAddress | InitialCredentialAccount; // InitialCredentialAccount = new account

type AccountAddress = Uint8Array;

type CredentialRegistrationID = Uint8Array; // sized 48 bytes,  "RegIdCred GroupElement"
type IdentityProviderIdentity = number; // IP_ID word32
type Threshold = number; // Threshold word8
export interface Policy {
    validTo: YearMonth; // CredentialValidTo
    createdAt: YearMonth; // CredentialCreatedAt
    revealedAttributes; // Map.Map AttributeTag AttributeValue
}

export interface YearMonth {
    year: number; // word16,
    month: number; // word8
}

export enum AttributeTag {
    firstName = 0,
    lastName = 1,
    sex = 2,
    dob = 3,
    countryOfResidence = 4,
    nationality = 5,
    idDocType = 6,
    idDocNo = 7,
    idDocIssuer = 8,
    idDocIssuedAt = 9,
    idDocExpiresAt = 10,
    nationalIdNo = 11,
    taxIdNo = 12,
}

type IpCdiSignature = Uint8Array;
type Proofs = Uint8Array;

// type holds the the type of setting, i.e. multisignature settings, so that
// the group of settings can be displayed together correctly.
export interface Settings {
    type: string;
    settings: Setting[];
}

// Reflects an entry of the 'setting' table (excluding the primary key).
export interface Setting {
    name: string;
    type: string;
    value: string;
    group: number;
}

// Reflects an entry of the 'setting_group' table.
export interface SettingGroup {
    id: number;
    name: string;
}

/**
 * Enum for the supported types of settings. If adding a new data type to the
 * settings table, then it should be represented here.
 */
export enum SettingTypeEnum {
    TEXT = 'text',
    BOOLEAN = 'boolean',
}

/**
 * The header part of an update instruction. 
 */
export interface UpdateHeader {
    // Word 64
    sequenceNumber: number;

    // Word 64
    effectiveTime: number;

    // Word 64
    timeout: number;

    // Word 32
    payloadSize: number;
}

// Currently we cannot see the difference between two ExchangeRate update instructions, so this type is 
// not specific enough. It should also contain the type from the enum.
export interface UpdateInstruction {
    header: UpdateHeader;
    
    // Contains the payload for an update instruction. It can be any of the 
    // update payloads available.
    payload: any;

    type: UpdateType;

    signatures: string[];
}

/**
 * Update type enumeration. The numbering/order is important as that corresponds
 * to the byte written when serializing the update instruction.
 */
export enum UpdateType {
    UpdateAuthorization = 0,
    UpdateProtocol = 1,
    UpdateElectionDifficulty = 2,
    UpdateEuroPerEnergy = 3,
    UpdateMicroGTUPerEuro = 4,
    UpdateFoundationAccount = 5,
    UpdateMintDistribution = 6,
    UpdateTransactionFeeDistribution = 7,
    UpdateGASRewards = 8
}

export function instanceOfAccountTransaction(object: any): object is AccountTransaction {
    return 'transactionKind' in object;
}

export function instanceOfUpdateInstruction(object: any): object is UpdateInstruction {
    return 'header' in object;
}

/**
 * Interface definition for classes that can serialize and handle
 * signing of the different transaction types.
 */
export interface TransactionHandler<T> {
    instanceOf: (transaction: T) => boolean;
    serializeTransaction: (transaction: T) => Buffer;
    signTransaction: (any, transaction: T) => Promise<Buffer>;
}
