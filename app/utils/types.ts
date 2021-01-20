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

// Reflects the attributes of an Identity, which describes
// the owner of the identity.
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

// Contains the attributes of an identity.
export interface AttributeList {
    createdAt: string;
    validTo: string;
    maxAccounts: number;
    chosenAttributes: ChosenAttributes;
}

// Reflects the structure of an identity's IdentityObject
// which is created during identity Issuance.
export interface IdentityObject {
    attributeList: AttributeList;
    // TODO Implement all the other fields when needed.
}

// Statuses that an identity can have.
export enum IdentityStatus {
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Pending = 'pending',
}

/**
 * This Interface models the structure of the identities stored in the database.
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

// Statuses that an account can have.
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
    identityName?: string;
    status: AccountStatus;
    credential?: string;
}

// The different types of an AccountTransaction.
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

// Structure of an accountTransaction, which is expected
// the blockchain's nodes
export interface AccountTransaction {
    sender: AccountAddress;
    nonce: number;
    energyAmount: number;
    expiry: number;
    transactionKind: TransactionKind;
    payload;
}

// Types of block items, and their identifier numbers
export enum BlockItemKind {
    AccountTransactionKind = 0,
    CredentialDeploymentKind = 1,
    UpdateInstructionKind = 2,
}

// Reflects the structure of CredentialDeploymentInformation
// from the crypto dependency.
export interface CredentialDeploymentInformation {
    account: CredentialAccount;
    regId: RegId;
    ipId: IpIdentity;
    revocationThreshold: Threshold;
    arData: Record<string, ArInfo>;
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

// Statuses that a Transaction can have.
export enum TransactionStatus {
    received = 1,
    absent = 2,
    comitted = 3,
    finalized = 4,
}

// Types of origins that a Transaction can have.
export enum OriginType {
    self,
    account,
    reward,
    none,
}

/**
 * This Interface models the structure of the transfer transactions stored in the database
 */
export interface TransferTransaction {
    remote: boolean;
    originType: OriginType;
    transactionKind: TransactionKind;
    id: number;
    blockHash: Hex;
    blockTime: string;
    total: string;
    success: boolean;
    transactionHash?: Hex;
    subtotal?: string;
    cost?: string;
    details: string;
    encrypted?: string;
    fromAddress: Hex;
    toAddress: Hex;
    status: TransactionStatus;
    rejectReason?: string;
}

// Reflects the structure given by the node,
// in a getAccountInfo request
export interface AccountInfo {
    accountAmount: string;
    accountReleaseSchedule: AccountReleaseSchedule; // TODO
    accountBaker: AccountBakerDetails; // TODO
}

// Reflects the type, which the account Release Schedule is comprised of.
export interface ScheduleItem {
    amount: string;
    transactions: Hex[];
    timestamp: number;
}

// A description of an entity, used for Identity Provider and Anonymity Revoker
export interface Description {
    name: string;
    url: string;
    description: string;
}

// Identity Provider information
export interface IpInfo {
    ipIdentity: number;
    ipDescription: Description;
    ipVerifyKey: Hex;
    ipCdiVerifyKey: Hex;
}

// Structure of the metadata which is provided, about an identityProvider,
// but is not contained in IpInfo.
export interface IdentityProviderMetaData {
    issuanceStart: string;
    icon: string;
}

// Anonymity Revoker information
export interface ArInfo {
    arIdentity: number;
    arDescription: Description;
    arPublicKey: Hex;
}

// Reflects the structure of an Identity Provider.
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

/**
 * Units of Time for the unix timestamp.
 * Values are set so that (time in unit) * unit = (time in milliseconds)
 */
export enum TimeStampUnit {
    seconds = 1e3,
    milliSeconds = 1,
}

// Model of the address book entries, as they are stored in the database
export interface AddressBookEntry {
    name: string;
    address: string;
    note: string;
}
