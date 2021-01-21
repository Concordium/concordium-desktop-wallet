import { AccountAddress } from '../proto/api_pb';

type Hex = string;
type Proofs = Hex;

export enum SchemeId {
    Ed25519 = 0,
}

export interface VerifyKey {
    scheme: SchemeId;
    key: Hex;
}

export interface NewAccount {
    keys: VerifyKey[];
    threshold: number;
}

// AccountAddress if deploying credentials to an existing account, and
// NewAccount for deployment of a new account.
// TODO: Add support for AccountAddress for updating existing account credentials.
type CredentialAccount = NewAccount;
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

export enum IdentityStatus {
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Pending = 'pending',
}

/**
 * This Interface models the structure of the identities stored in the database
 */
export interface Identity {
    id: number;
    name: string;
    identityObject: string;
    status: IdentityStatus;
    detail: string;
    codeUri: string;
    identityProvider: string;
    randomness: string;
}

export enum AccountStatus {
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Pending = 'pending',
}

/**
 * This Interface models the structure of the accounts stored in the database
 */
export interface Account {
    accountNumber: number;
    name: string;
    address: Hex;
    identityId: number;
    status: AccountStatus;
    credential?: string;
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

export interface CredentialDeploymentInformation {
    account: CredentialAccount;
    regId: RegId;
    ipId: IpIdentity;
    revocationThreshold: Threshold;
    arData: Record<string, unknown>; // Map with ar data
    policy: Policy;
    proofs: Proofs;
}

type AccountAddress = Uint8Array;

// 48 bytes containing a group element.
type RegId = Hex;

// An integer (32 bit) specifying the identity provider.
type IpIdentity = number;

// An integer (8 bit) specifying the revocation threshold.
type Threshold = number;

export interface Policy {
    validTo: YearMonth; // CredentialValidTo
    createdAt: YearMonth; // CredentialCreatedAt
    revealedAttributes: Record<string, unknown>; // Map.Map AttributeTag AttributeValue
}

type YearMonth = string; // "YYYYMM"

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

/**
 * This interface models the PublicInformationForIp structure, which we get from the Crypto Dependency
 * (And is used during Identity Issuance)
 */
export interface PublicInformationForIp {
    idCredPub: Hex;
    regId: RegId;
    publicKeys: NewAccount;
}

export interface IdentityProviderMetaData {
    issuanceStart: string;
    icon: string;
}

export interface Description {
    name: string;
    url: string;
    description: string;
}

export interface IpInfo {
    ipIdentity: number;
    ipDescription: Description;
    ipVerifyKey: Hex;
    ipCdiVerifyKey: Hex;
}

export interface ArInfo {
    arIdentity: number;
    arDescription: Description;
    arPublicKey: Hex;
}

export interface IdentityProvider {
    ipInfo: IpInfo;
    arsInfos: Record<string, ArInfo>; // objects with ArInfo fields (and numbers as field names)
    metadata: IdentityProviderMetaData;
}

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
    Text = 'text',
    Boolean = 'boolean',
}

// Contains an CredentialDeployment, and all the necessary extra details to complete the deployment
// TODO: Find better name
export interface CredentialDeploymentDetails {
    credentialDeploymentInfo: CredentialDeploymentInformation;
    credentialDeploymentInfoHex: Hex;
    accountAddress: Hex;
    transactionId: Hex;
}

// Model of the address book entries, as they are stored in the database
export interface AddressBookEntry {
    name: string;
    address: string;
    note: string;
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
    payload;

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
    UpdateGASRewards = 8,
}

export function instanceOfAccountTransaction(
    object
): object is AccountTransaction {
    return 'transactionKind' in object;
}

export function instanceOfUpdateInstruction(
    object
): object is UpdateInstruction {
    return 'header' in object;
}

/**
 * Interface definition for classes that can serialize and handle
 * signing of the different transaction types.
 */
export interface TransactionHandler<T> {
    transaction: T;
    instanceOf: () => boolean;
    serializeTransaction: () => Buffer;
    signTransaction: (any) => Promise<Buffer>;
}

/**
 * The model for multi signature transaction proposals, which maps into the
 * database model as well.
 */
export interface MultiSignatureTransaction {
    // logical id in the database
    id: number;
    // The JSON serialization of the transaction
    transaction: string;
    // The minimum required signatures for the transaction
    // to be accepted on chain.
    threshold: number;
    
    status: string;
}

/**
 *  An enumeration that contains the menu items available in the menu
 *  on the multisignature page.
 */
export enum MultiSignatureMenuItems {
    MakeNewProposal,
    ProposedTransactions,
    SignTransaction,
}
