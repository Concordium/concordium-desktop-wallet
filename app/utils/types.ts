/* eslint-disable @typescript-eslint/ban-types */
import type { Buffer } from 'buffer/';
import type { Dispatch as GenericDispatch, AnyAction } from 'redux';
import type { HTMLAttributes } from 'react';
import type { RegisterOptions } from 'react-hook-form';
import type { BakerId } from '@concordium/web-sdk';
import {
    OpenStatus,
    TransactionKindString,
} from '@concordium/common-sdk/lib/types';
import { RejectReason } from './node/RejectReasonHelper';
import type { ExternalCredential, Genesis } from '~/database/types';

export type {
    AccountInfo,
    AccountEncryptedAmount,
    BakerId,
} from '@concordium/web-sdk';
export { OpenStatus, TransactionKindString };

export type Dispatch = GenericDispatch<AnyAction>;

export type Hex = string;
type Proofs = Hex;
type Word64 = bigint;
type Word32 = number;
type Word16 = number;
export type Word8 = number;
type JSONString = string; // indicates that it is some object that has been stringified.
export type Amount = bigint;

export interface Fraction {
    numerator: Word64;
    denominator: Word64;
}

export enum SchemeId {
    Ed25519 = 0,
}

export interface VerifyKey {
    schemeId: string;
    verifyKey: Hex;
}

export interface SignedPublicKey {
    key: Hex;
    signature: Hex;
}

export interface NewAccount {
    keys: VerifyKey[];
    threshold: number;
}

export interface Versioned<T> {
    v: number;
    value: T;
}

export interface Typed<T> {
    type: string;
    contents: T;
}

// Reflects the attributes of an Identity, which describes
// the owner of the identity.
export enum AttributeKey {
    firstName,
    lastName,
    sex,
    dob,
    countryOfResidence,
    nationality,
    idDocType,
    idDocNo,
    idDocIssuer,
    idDocIssuedAt,
    idDocExpiresAt,
    nationalIdNo,
    taxIdNo,
}

export type AttributeKeyName = keyof typeof AttributeKey;

export type ChosenAttributes = {
    [P in keyof typeof AttributeKey]: string;
};

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
    RejectedAndWarned = 'rejectedAndWarned',
    Pending = 'pending',
    Recovered = 'recovered',
    // eslint-disable-next-line no-shadow
    Genesis = 'genesis',
}

// IdentityVersion = 0 means that the identity was created using the legacy BLS12-381 key generation,
// decoding the seed as UTF-8.
// IdentityVersion = 1 means that the identity was created using the corrected BLS12-381 key generation,
// decoding the seed as Hex.
export type IdentityVersion = 1 | 0;

export enum BlsKeyTypes {
    Seed = 0,
    Key = 1,
}

interface BaseIdentity {
    status: IdentityStatus;
    id: number;
    identityNumber: number;
    name: string;
    codeUri: string;
    identityProvider: string;
    randomness: string;
    walletId: number;
    version: IdentityVersion;
}

export interface ConfirmedIdentity extends BaseIdentity {
    status: IdentityStatus.Confirmed;
    identityObject: string;
}

export interface RejectedIdentity extends BaseIdentity {
    status: IdentityStatus.RejectedAndWarned | IdentityStatus.Rejected;
    detail: string;
}

export interface RecoveredIdentity extends Omit<BaseIdentity, 'codeUri'> {
    status: IdentityStatus.Recovered | IdentityStatus.Genesis;
}

export interface PendingIdentity extends BaseIdentity {
    status: IdentityStatus.Pending;
}

/**
 * This Interface models the structure of the identities stored in the database.
 */
export type Identity =
    | ConfirmedIdentity
    | RejectedIdentity
    | RecoveredIdentity
    | PendingIdentity;

// Statuses that an account can have.
export enum AccountStatus {
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Pending = 'pending',
    // eslint-disable-next-line no-shadow
    Genesis = 'genesis',
}

// The ids of the different types of an AccountTransaction.
export enum TransactionKindId {
    Deploy_module = 0,
    Initialize_smart_contract_instance = 1,
    Update_smart_contract_instance = 2,
    Simple_transfer = 3,
    Add_baker = 4,
    Remove_baker = 5,
    Update_baker_stake = 6,
    Update_baker_restake_earnings = 7,
    Update_baker_keys = 8,
    Update_credential_keys = 13,
    Encrypted_transfer = 16,
    Transfer_to_encrypted = 17,
    Transfer_to_public = 18,
    Transfer_with_schedule = 19,
    Update_credentials = 20,
    Register_data = 21,
    Simple_transfer_with_memo = 22,
    Encrypted_transfer_with_memo = 23,
    Transfer_with_schedule_and_memo = 24,
    Configure_baker = 25,
    Configure_delegation = 26,
}

export type BooleanFilters = { [P in TransactionKindString]?: boolean };
type DateString = string;

export interface TransactionDateFilter {
    fromDate?: DateString;
    toDate?: DateString;
}

export type TransactionFilter = BooleanFilters & TransactionDateFilter;

/**
 * This Interface models the structure of the accounts stored in the database
 */

export interface Account {
    name: string;
    address: Hex;
    identityId: number;
    identityName?: string;
    identityNumber?: number;
    status: AccountStatus;
    signatureThreshold?: number;
    totalDecrypted?: string;
    allDecrypted?: boolean;
    incomingAmounts?: string;
    transactionFilter: TransactionFilter;
    selfAmounts?: string;
    deploymentTransactionId?: string;
    isInitial: boolean;
}

export interface SimpleTransferPayload {
    amount: string;
    toAddress: string;
}

export interface EncryptedTransferPayload {
    plainTransferAmount: string;
    toAddress: string;
    remainingEncryptedAmount?: EncryptedAmount;
    remainingDecryptedAmount?: string;
    transferAmount?: EncryptedAmount;
    index?: string;
    proof?: string;
}

export interface TransferToEncryptedPayload {
    amount: string;
    newSelfEncryptedAmount?: EncryptedAmount;
    remainingDecryptedAmount?: string;
}

export interface TransferToPublicPayload {
    transferAmount: string;
    remainingEncryptedAmount?: EncryptedAmount;
    remainingDecryptedAmount?: string;
    index?: string;
    proof?: string;
}

export interface SchedulePoint {
    timestamp: string;
    amount: string;
}
export type Schedule = SchedulePoint[];

export interface ScheduledTransferPayload {
    schedule: Schedule;
    toAddress: string;
}

export interface AddedCredential {
    index: Word8;
    value: CredentialDeploymentInformation;
    note?: string;
}

export interface UpdateAccountCredentialsPayload {
    addedCredentials: AddedCredential[];
    removedCredIds: Hex[];
    threshold: number;
}

export type BakerVerifyKeys = {
    electionVerifyKey: Hex;
    signatureVerifyKey: Hex;
    aggregationVerifyKey: Hex;
};

export type BakerKeyProofs = {
    proofElection: Hex;
    proofSignature: Hex;
    proofAggregation: Hex;
};

export type AddBakerPayload = BakerVerifyKeys &
    BakerKeyProofs & {
        bakingStake: Amount;
        restakeEarnings: boolean;
    };

export type UpdateBakerKeysPayload = BakerVerifyKeys & BakerKeyProofs;

export type RemoveBakerPayload = {};

export type UpdateBakerStakePayload = {
    stake: Amount;
};

export type UpdateBakerRestakeEarningsPayload = {
    restakeEarnings: boolean;
};

export type RegisterDataPayload = {
    data: string;
};

export interface BakerKeysWithProofs {
    signatureVerifyKey: Hex;
    signatureKeyProof: Hex;
    electionVerifyKey: Hex;
    electionKeyProof: Hex;
    aggregationVerifyKey: Hex;
    aggregationKeyProof: Hex;
}

export interface ConfigureBakerPayload {
    stake?: Amount;
    restakeEarnings?: boolean;
    openForDelegation?: OpenStatus;
    keys?: BakerKeysWithProofs;
    metadataUrl?: string;
    transactionFeeCommission?: RewardFraction;
    bakingRewardCommission?: RewardFraction;
    finalizationRewardCommission?: RewardFraction;
}

export type DelegationTarget = null | BakerId;

export interface ConfigureDelegationPayload {
    stake?: Amount;
    restakeEarnings?: boolean;
    delegationTarget?: DelegationTarget;
}

export type TransactionPayload =
    | UpdateAccountCredentialsPayload
    | TransferToPublicPayload
    | TransferToEncryptedPayload
    | ScheduledTransferPayload
    | SimpleTransferPayload
    | EncryptedTransferPayload
    | AddBakerPayload
    | UpdateBakerKeysPayload
    | RemoveBakerPayload
    | UpdateBakerStakePayload
    | UpdateBakerRestakeEarningsPayload
    | RegisterDataPayload
    | ConfigureBakerPayload
    | ConfigureDelegationPayload;

// Structure of an accountTransaction, which is expected
// the blockchain's nodes
export interface AccountTransaction<
    PayloadType extends TransactionPayload = TransactionPayload
> {
    sender: Hex;
    nonce: string;
    energyAmount: string;
    estimatedFee?: Fraction;
    cost?: string;
    expiry: bigint;
    transactionKind: TransactionKindId;
    payload: PayloadType;
}

type WithMemo<Base extends {}> = Base & {
    memo: string;
};
export type SimpleTransferWithMemoPayload = WithMemo<SimpleTransferPayload>;
export type EncryptedTransferWithMemoPayload = WithMemo<EncryptedTransferPayload>;
export type ScheduledTransferWithMemoPayload = WithMemo<ScheduledTransferPayload>;

export type SimpleTransfer = AccountTransaction<SimpleTransferPayload>;
export type SimpleTransferWithMemo = AccountTransaction<SimpleTransferWithMemoPayload>;
export type EncryptedTransfer = AccountTransaction<EncryptedTransferPayload>;
export type EncryptedTransferWithMemo = AccountTransaction<EncryptedTransferWithMemoPayload>;
export type ScheduledTransfer = AccountTransaction<ScheduledTransferPayload>;
export type ScheduledTransferWithMemo = AccountTransaction<ScheduledTransferWithMemoPayload>;
export type TransferToEncrypted = AccountTransaction<TransferToEncryptedPayload>;
export type UpdateAccountCredentials = AccountTransaction<UpdateAccountCredentialsPayload>;
export type TransferToPublic = AccountTransaction<TransferToPublicPayload>;
export type AddBaker = AccountTransaction<AddBakerPayload>;
export type UpdateBakerKeys = AccountTransaction<UpdateBakerKeysPayload>;
export type RemoveBaker = AccountTransaction<RemoveBakerPayload>;
export type UpdateBakerStake = AccountTransaction<UpdateBakerStakePayload>;
export type UpdateBakerRestakeEarnings = AccountTransaction<UpdateBakerRestakeEarningsPayload>;
export type RegisterData = AccountTransaction<RegisterDataPayload>;
export type ConfigureBaker = AccountTransaction<ConfigureBakerPayload>;
export type ConfigureDelegation = AccountTransaction<ConfigureDelegationPayload>;

// Types of block items, and their identifier numbers
export enum BlockItemKind {
    AccountTransactionKind = 0,
    CredentialDeploymentKind = 1,
    UpdateInstructionKind = 2,
}

export interface ChainArData {
    encIdCredPubShare: Hex;
}

export interface CredentialDeploymentValues {
    regId?: Hex;
    credId: Hex;
    ipIdentity: IpIdentity;
    revocationThreshold: Threshold;
    credentialPublicKeys: CredentialPublicKeys;
    policy: Policy;
    arData: Record<string, ChainArData>;
}

export interface IdOwnershipProofs {
    challenge: Hex;
    commitments: Hex;
    credCounterLessThanMaxAccounts: Hex;
    proofIdCredPub: Record<string, Hex>;
    proofIpSig: Hex;
    proofRegId: Hex;
    sig: Hex;
}

// Reflects the structure of UnsignedCredentialDeploymentInformation
// from the crypto dependency.
export interface UnsignedCredentialDeploymentInformation
    extends CredentialDeploymentValues {
    proofs: IdOwnershipProofs;
}

// Reflects the structure of CredentialDeploymentInformation
// from the crypto dependency.
export interface CredentialDeploymentInformation
    extends CredentialDeploymentValues {
    proofs: Proofs;
}

type AttributesRandomness = Record<AttributeKey, string>;

export interface CommitmentsRandomness {
    idCredSecRand: string;
    prfRand: string;
    credCounterRand: string;
    maxAccountsRand: string;
    attributesRand: AttributesRandomness;
}

export interface Credential {
    accountAddress: string;
    credentialIndex?: number;
    credentialNumber: number;
    identityId: number;
    identityNumber?: number;
    walletId?: number;
    credId: Hex;
    policy: JSONString;
    randomness?: JSONString;
}

export interface DeployedCredential extends Credential {
    credentialIndex: number;
}

export interface CredentialWithIdentityNumber extends Credential {
    identityNumber: number;
}

export function instanceOfDeployedCredential(
    object: Credential
): object is DeployedCredential {
    return !(
        object.credentialIndex === undefined || object.credentialIndex === null
    );
}

export function instanceOfCredentialWithIdentityNumber(
    object: Credential
): object is CredentialWithIdentityNumber {
    return !(
        object.credentialNumber === undefined ||
        object.credentialNumber === null
    );
}

// 48 bytes containing a group element.
type RegId = Hex;

// An integer (32 bit) specifying the identity provider.
type IpIdentity = number;

// An integer (8 bit) specifying the revocation threshold.
type Threshold = number;

export interface Policy {
    validTo: YearMonth; // CredentialValidTo
    createdAt: YearMonth; // CredentialCreatedAt
    revealedAttributes: Record<string, string>; // Map.Map AttributeTag AttributeValue
}

export type YearMonth = string; // "YYYYMM"
export type YearMonthDate = string; // "YYYYMMDD"

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

export interface CredentialPublicKeys {
    keys: Record<number, VerifyKey>;
    threshold: number;
}

/**
 * This interface models the PublicInformationForIp structure, which we get from the Crypto Dependency
 * (And is used during Identity Issuance)
 */
export interface PublicInformationForIp {
    idCredPub: Hex;
    regId: RegId;
    publicKeys: CredentialPublicKeys;
}

export interface IdObjectRequest {
    pubInfoForIp: PublicInformationForIp;
    // TODO: add remaining fields
}

// Statuses that a transaction can have.
export enum TransactionStatus {
    Finalized = 'finalized',
    Committed = 'committed',
    Failed = 'failed',
    Rejected = 'rejected',
    Pending = 'pending',
}

// Types of origins that a Transaction can have.
export enum OriginType {
    Self = 'self',
    Account = 'account',
    Reward = 'reward',
    None = 'none',
}

/**
 * This Interface models the structure of the transfer transactions stored in the database
 */
export interface TransferTransaction {
    transactionKind: TransactionKindString;
    id?: string; // only remote transactions have ids.
    blockHash: Hex;
    blockTime: string;
    transactionHash: Hex;
    subtotal?: string;
    cost?: string;
    encrypted?: string;
    schedule?: string;
    fromAddress: Hex;
    toAddress: Hex;
    status: TransactionStatus;
    rejectReason?: RejectReason | string;
    decryptedAmount?: string;
    memo?: string;
    events?: string[];
}

export interface TransferTransactionWithNames extends TransferTransaction {
    fromName?: string;
    toName?: string;
}

export interface DecryptedTransferTransaction extends TransferTransaction {
    decryptedAmount: string;
}

export type EncryptedAmount = Hex;

export interface TypedCredentialDeploymentInformation {
    contents: CredentialDeploymentInformation;
    type: string;
}

// Reflects the type, which the account Release Schedule is comprised of.
export interface ScheduleItem {
    amount: string;
    transactions: Hex[];
    timestamp: string;
}

// A description of an entity, used for Identity Provider and Identity Disclosure Authority
export interface Description {
    name: string;
    url: string;
    description: string;
}

export interface SerializedTextWithLength {
    data: Buffer;
    length: Buffer;
}

export interface SerializedDescription {
    name: SerializedTextWithLength;
    url: SerializedTextWithLength;
    description: SerializedTextWithLength;
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
    support: string;
}

// Identity Disclosure Authority information
export interface ArInfo {
    arIdentity: number;
    arDescription: Description;
    arPublicKey: Hex;
}

export interface Global {
    onChainCommitmentKey: string;
    bulletproofGenerators: string;
    genesisString: string;
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
    Boolean = 'boolean',
    Connection = 'connection',
    Password = 'password',
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
    note?: string;
    readOnly: boolean;
}

/**
 * The header part of an update instruction. The payload size is allowed
 * optional so that the header can be created before knowing the payload
 * size of the associated payload.
 */
export interface UpdateHeader {
    sequenceNumber: Word64;
    effectiveTime: Word64;
    timeout: Word64;
    payloadSize?: Word32;
}

export interface UpdateInstructionSignature {
    authorizationPublicKey: string;
    signature: string;
}

export interface UpdateInstructionSignatureWithIndex {
    signature: string;
    authorizationKeyIndex: number;
}

export interface UpdateInstruction<
    T extends UpdateInstructionPayload = UpdateInstructionPayload
> {
    header: UpdateHeader;
    payload: T;
    type: UpdateType;
    signatures: UpdateInstructionSignature[];
}

export type UpdateInstructionPayload =
    | ExchangeRate
    | TransactionFeeDistribution
    | FoundationAccount
    | MintDistributionV0
    | MintDistributionV1
    | ProtocolUpdate
    | GasRewards
    | BakerStakeThreshold
    | ElectionDifficulty
    | HigherLevelKeyUpdate
    | AuthorizationKeysUpdate
    | AddAnonymityRevoker
    | AddIdentityProvider
    | CooldownParameters
    | PoolParameters
    | TimeParameters
    | TimeoutParameters
    | MinBlockTime
    | BlockEnergyLimit
    | FinalizationCommitteeParameters;

// An actual signature, which goes into an account transaction.
export type Signature = Hex;

type KeyIndex = Word8;
// Signatures from a single credential, for an AccountTransaction
export type TransactionCredentialSignature = Record<KeyIndex, Signature>;

type CredentialIndex = Word8;
// The signature of an account transaction.
export type TransactionAccountSignature = Record<
    CredentialIndex,
    TransactionCredentialSignature
>;

export interface AccountTransactionWithSignature<
    PayloadType extends TransactionPayload = TransactionPayload
> extends AccountTransaction<PayloadType> {
    signatures: TransactionAccountSignature;
}

export type Transaction =
    | AccountTransaction
    | AccountTransactionWithSignature
    | UpdateInstruction;

/**
 * Internal enumeration of the different update types that are available. This
 * does not correspond one-to-one with the transaction UpdateType enum, and is
 * necessary due to the key update transactions sharing the same update type.
 */
export enum UpdateType {
    UpdateProtocol,
    UpdateElectionDifficulty,
    UpdateEuroPerEnergy,
    UpdateMicroGTUPerEuro,
    UpdateFoundationAccount,
    UpdateMintDistribution,
    UpdateTransactionFeeDistribution,
    UpdateGASRewards,
    UpdateBakerStakeThreshold,
    UpdateRootKeys,
    UpdateLevel1KeysUsingRootKeys,
    UpdateLevel1KeysUsingLevel1Keys,
    UpdateLevel2KeysUsingRootKeys,
    UpdateLevel2KeysUsingLevel1Keys,
    AddAnonymityRevoker,
    AddIdentityProvider,
    CooldownParameters,
    PoolParameters,
    TimeParameters,
    UpdateMintDistributionV1,
    TimeoutParameters,
    MinBlockTime,
    BlockEnergyLimit,
    FinalizationCommitteeParameters,
    UpdateGASRewardsV1,
}

export enum RootKeysUpdateTypes {
    RootKeysRootUpdate,
    Level1KeysRootUpdate,
    Level2KeysRootUpdate,
}

export enum Level1KeysUpdateTypes {
    Level1KeysLevel1Update,
    Level2KeysLevel1Update,
}
export function instanceOfAccountTransaction(
    object: Transaction
): object is AccountTransaction {
    return 'transactionKind' in object;
}

export function instanceOfUpdateInstruction(
    object: Transaction
): object is UpdateInstruction<UpdateInstructionPayload> {
    return 'header' in object;
}

export function instanceOfUpdateInstructionSignature(
    object: TransactionCredentialSignature | UpdateInstructionSignature
): object is UpdateInstructionSignature {
    return 'signature' in object && 'authorizationPublicKey' in object;
}

export function instanceOfAccountTransactionWithSignature(
    object: Transaction
): object is AccountTransactionWithSignature {
    return instanceOfAccountTransaction(object) && 'signatures' in object;
}

export function instanceOfSimpleTransfer(
    object: AccountTransaction<TransactionPayload>
): object is SimpleTransfer {
    return TransactionKindId.Simple_transfer === object.transactionKind;
}
export function instanceOfSimpleTransferWithMemo(
    object: AccountTransaction<TransactionPayload>
): object is SimpleTransferWithMemo {
    return (
        TransactionKindId.Simple_transfer_with_memo === object.transactionKind
    );
}

export function instanceOfTransferToEncrypted(
    object: AccountTransaction<TransactionPayload>
): object is TransferToEncrypted {
    return object.transactionKind === TransactionKindId.Transfer_to_encrypted;
}

export function instanceOfTransferToPublic(
    object: AccountTransaction<TransactionPayload>
): object is TransferToPublic {
    return object.transactionKind === TransactionKindId.Transfer_to_public;
}

export function instanceOfEncryptedTransfer(
    object: AccountTransaction<TransactionPayload>
): object is EncryptedTransfer {
    return object.transactionKind === TransactionKindId.Encrypted_transfer;
}

export function instanceOfEncryptedTransferWithMemo(
    object: AccountTransaction<TransactionPayload>
): object is EncryptedTransferWithMemo {
    return (
        object.transactionKind ===
        TransactionKindId.Encrypted_transfer_with_memo
    );
}

export function instanceOfScheduledTransfer(
    object: AccountTransaction<TransactionPayload>
): object is ScheduledTransfer {
    return object.transactionKind === TransactionKindId.Transfer_with_schedule;
}

export function instanceOfScheduledTransferWithMemo(
    object: AccountTransaction<TransactionPayload>
): object is ScheduledTransferWithMemo {
    return (
        object.transactionKind ===
        TransactionKindId.Transfer_with_schedule_and_memo
    );
}

export function instanceOfUpdateAccountCredentials(
    object: AccountTransaction<TransactionPayload>
): object is UpdateAccountCredentials {
    return object.transactionKind === TransactionKindId.Update_credentials;
}

export function instanceOfRegisterData(
    object: AccountTransaction<TransactionPayload>
): object is RegisterData {
    return object.transactionKind === TransactionKindId.Register_data;
}

export function instanceOfAddBaker(
    object: AccountTransaction<TransactionPayload>
): object is AddBaker {
    return object.transactionKind === TransactionKindId.Add_baker;
}

export function instanceOfUpdateBakerKeys(
    object: AccountTransaction<TransactionPayload>
): object is UpdateBakerKeys {
    return object.transactionKind === TransactionKindId.Update_baker_keys;
}

export function instanceOfRemoveBaker(
    object: AccountTransaction<TransactionPayload>
): object is RemoveBaker {
    return object.transactionKind === TransactionKindId.Remove_baker;
}

export function instanceOfUpdateBakerStake(
    object: AccountTransaction<TransactionPayload>
): object is UpdateBakerStake {
    return object.transactionKind === TransactionKindId.Update_baker_stake;
}

export function instanceOfUpdateBakerRestakeEarnings(
    object: AccountTransaction<TransactionPayload>
): object is UpdateBakerRestakeEarnings {
    return (
        object.transactionKind ===
        TransactionKindId.Update_baker_restake_earnings
    );
}

export function instanceOfConfigureBaker(
    object: AccountTransaction<TransactionPayload>
): object is ConfigureBaker {
    return object.transactionKind === TransactionKindId.Configure_baker;
}

export function instanceOfConfigureDelegation(
    object: AccountTransaction<TransactionPayload>
): object is ConfigureDelegation {
    return object.transactionKind === TransactionKindId.Configure_delegation;
}

export function isExchangeRate(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<ExchangeRate> {
    return (
        UpdateType.UpdateMicroGTUPerEuro === transaction.type ||
        UpdateType.UpdateEuroPerEnergy === transaction.type
    );
}

export function isAddIdentityProvider(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<AddIdentityProvider> {
    return UpdateType.AddIdentityProvider === transaction.type;
}

export function isAddAnonymityRevoker(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<AddAnonymityRevoker> {
    return UpdateType.AddAnonymityRevoker === transaction.type;
}

export function isTransactionFeeDistribution(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<TransactionFeeDistribution> {
    return UpdateType.UpdateTransactionFeeDistribution === transaction.type;
}

export function isFoundationAccount(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<FoundationAccount> {
    return UpdateType.UpdateFoundationAccount === transaction.type;
}

export function isMintDistribution(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<MintDistribution> {
    return (
        UpdateType.UpdateMintDistribution === transaction.type ||
        UpdateType.UpdateMintDistributionV1 === transaction.type
    );
}

export function isProtocolUpdate(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<ProtocolUpdate> {
    return UpdateType.UpdateProtocol === transaction.type;
}

export function isGasRewards(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<GasRewards> {
    return (
        UpdateType.UpdateGASRewards === transaction.type ||
        UpdateType.UpdateGASRewardsV1 === transaction.type
    );
}

export function isBakerStakeThreshold(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<BakerStakeThreshold> {
    return UpdateType.UpdateBakerStakeThreshold === transaction.type;
}

export function isElectionDifficulty(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<ElectionDifficulty> {
    return UpdateType.UpdateElectionDifficulty === transaction.type;
}

export function isUpdateRootKeys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
    return UpdateType.UpdateRootKeys === transaction.type;
}

export function isUpdateLevel1KeysWithRootKeys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
    return UpdateType.UpdateLevel1KeysUsingRootKeys === transaction.type;
}

export function isUpdateLevel2KeysWithRootKeys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<AuthorizationKeysUpdate> {
    return UpdateType.UpdateLevel2KeysUsingRootKeys === transaction.type;
}

export function isUpdateUsingRootKeys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): boolean {
    return (
        isUpdateRootKeys(transaction) ||
        isUpdateLevel1KeysWithRootKeys(transaction) ||
        isUpdateLevel2KeysWithRootKeys(transaction)
    );
}

export function isUpdateLevel1KeysWithLevel1Keys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
    return UpdateType.UpdateLevel1KeysUsingLevel1Keys === transaction.type;
}

export function isUpdateLevel2KeysWithLevel1Keys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<AuthorizationKeysUpdate> {
    return UpdateType.UpdateLevel2KeysUsingLevel1Keys === transaction.type;
}

export function isUpdateUsingLevel1Keys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): boolean {
    return (
        isUpdateLevel1KeysWithLevel1Keys(transaction) ||
        isUpdateLevel2KeysWithLevel1Keys(transaction)
    );
}

export function isTimeParameters(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<TimeParameters> {
    return UpdateType.TimeParameters === transaction.type;
}

export function isCooldownParameters(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<CooldownParameters> {
    return UpdateType.CooldownParameters === transaction.type;
}

export function isPoolParameters(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<PoolParameters> {
    return UpdateType.PoolParameters === transaction.type;
}

export function isBlockEnergyLimit(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<BlockEnergyLimit> {
    return UpdateType.BlockEnergyLimit === transaction.type;
}

export function isTimeoutParameters(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<TimeoutParameters> {
    return UpdateType.TimeoutParameters === transaction.type;
}

export function isFinalizationCommitteeParameters(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<FinalizationCommitteeParameters> {
    return UpdateType.FinalizationCommitteeParameters === transaction.type;
}

export function isMinBlockTime(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<MinBlockTime> {
    return UpdateType.MinBlockTime === transaction.type;
}

/**
 * Enum for the different states that a multi signature transaction proposal
 * can go through.
 */
export enum MultiSignatureTransactionStatus {
    Closed = 'closed',
    Committed = 'committed',
    Expired = 'expired',
    Failed = 'failed',
    Finalized = 'finalized',
    Open = 'open',
    Rejected = 'rejected',
    Submitted = 'submitted',
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
    // The current state of the proposal
    status: MultiSignatureTransactionStatus;
}

/**
 *  An enumeration that contains the menu items available in the menu
 *  on the multisignature page.
 */
export enum MultiSignatureMenuItems {
    MakeNewProposal = 'Make new proposal',
    ProposedTransactions = 'Proposed transactions',
    SignTransaction = 'Sign transaction',
    ExportKey = 'Export public-key',
}

export type ExchangeRate = Fraction;

/**
 * A reward fraction with a resolution of 1/100000, i.e. the
 * denominator is implicitly 100000, and the interface therefore
 * only contains the numerator value.
 */
export type RewardFraction = Word32;

export type AddIdentityProvider = IpInfo;
export type AddAnonymityRevoker = ArInfo;

export interface TransactionFeeDistribution {
    baker: RewardFraction;
    gasAccount: RewardFraction;
}

export interface FoundationAccount {
    address: string;
}

export interface MintRate {
    mantissa: Word32;
    exponent: Word8;
}

export interface MintDistributionV0 {
    version: 0;
    mintPerSlot: MintRate;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

export interface MintDistributionV1 {
    version: 1;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

export type MintDistribution = MintDistributionV0 | MintDistributionV1;

export interface ProtocolUpdate {
    message: string;
    specificationUrl: string;
    specificationHash: Hex;
    specificationAuxiliaryData?: string;
}

export interface GasRewardsV0 {
    version: 0;
    baker: RewardFraction;
    finalizationProof: RewardFraction;
    accountCreation: RewardFraction;
    chainUpdate: RewardFraction;
}

export interface GasRewardsV1 {
    version: 1;
    baker: RewardFraction;
    accountCreation: RewardFraction;
    chainUpdate: RewardFraction;
}

export type GasRewards = GasRewardsV0 | GasRewardsV1;

export interface BakerStakeThreshold {
    threshold: Word64;
}

export interface ElectionDifficulty {
    electionDifficulty: Word32;
}

export interface BlockEnergyLimit {
    blockEnergyLimit: Word64;
}

export interface FinalizationCommitteeParameters {
    minFinalizers: Word32;
    maxFinalizers: Word32;
    relativeStakeThresholdFraction: Word32;
}

export interface MinBlockTime {
    minBlockTime: Word64;
}

export interface TimeoutParameters {
    timeoutBase: Word64;
    timeoutIncrease: Fraction;
    timeoutDecrease: Fraction;
}

export interface TimeParameters {
    rewardPeriodLength: Word64;
    mintRatePerPayday: MintRate;
}

export interface CooldownParameters {
    poolOwnerCooldown: Word64;
    delegatorCooldown: Word64;
}

export interface CommissionRates {
    finalizationRewardCommission: RewardFraction;
    bakingRewardCommission: RewardFraction;
    transactionFeeCommission: RewardFraction;
}

export interface CommissionRange {
    min: RewardFraction;
    max: RewardFraction;
}

export interface CommissionRanges {
    finalizationRewardCommission: CommissionRange;
    bakingRewardCommission: CommissionRange;
    transactionFeeCommission: CommissionRange;
}

export interface PoolParameters {
    passiveCommissions: CommissionRates;
    commissionBounds: CommissionRanges;
    minimumEquityCapital: Word64;
    capitalBound: RewardFraction;
    leverageBound: Fraction;
}

export enum KeyUpdateEntryStatus {
    Added,
    Removed,
    Unchanged,
}

export interface KeyWithStatus {
    key: VerifyKey;
    status: KeyUpdateEntryStatus;
}

export type HigherLevelKeyUpdateType = 0 | 1;
/**
 * The higher level key update covers three transaction types:
 *  - Updating root keys with root keys
 *  - Updating level 1 keys with root keys
 *  - Updating level 1 keys with level 1 keys
 */
export interface HigherLevelKeyUpdate {
    // Has to be 0 when updating root keys with root keys,
    // 1 when updating level 1 keys with root keys, and
    // 0 when updating level 1 keys with level 1 keys.
    keyUpdateType: HigherLevelKeyUpdateType;
    updateKeys: KeyWithStatus[];
    threshold: number;
}

export interface KeyIndexWithStatus {
    index: Word16;
    status: KeyUpdateEntryStatus;
}

export enum AccessStructureEnum {
    emergency,
    protocol,
    consensus,
    euroPerEnergy,
    microGtuPerEuro,
    foundationAccount,
    mintDistribution,
    transactionFeeDistribution,
    gasRewards,
    poolParameters,
    addAnonymityRevoker,
    addIdentityProvider,
    cooldownParameters,
    timeParameters,
}

export interface AccessStructure {
    publicKeyIndicies: KeyIndexWithStatus[];
    threshold: Word16;
    type: AccessStructureEnum;
}

/**
 * Tag to determine which keys are updated (and which version of the update it is)
 * Note that these values don't align with the values on chain, because the on-chain values
 * have collision between the versions.
 */
export enum AuthorizationKeysUpdateType {
    Level1V0, // serialized as 1
    Level1V1, // serialized as 2
    RootV0, // serialized as 2
    RootV1, // serialized as 3
}

export function getAuthorizationKeysUpdateVersion(
    type: AuthorizationKeysUpdateType
): number {
    switch (type) {
        case AuthorizationKeysUpdateType.RootV0:
        case AuthorizationKeysUpdateType.Level1V0:
            return 0;
        case AuthorizationKeysUpdateType.RootV1:
        case AuthorizationKeysUpdateType.Level1V1:
            return 1;
        default:
            throw new Error('Unknown authorization key update type');
    }
}

export interface AuthorizationKeysUpdate {
    keyUpdateType: AuthorizationKeysUpdateType;
    keys: VerifyKey[];
    accessStructures: AccessStructure[];
}

export interface TransactionDetails {
    events: string[];
    rawRejectReason: RejectReasonWithContents;
    transferSource?: Hex;
    transferDestination?: Hex;
    inputEncryptedAmount?: EncryptedAmount;
    type: TransactionKindString;
    outcome: string;
    memo?: Hex;
    registeredData?: Hex;
}

export interface TransactionOrigin {
    type: OriginType;
    address?: Hex;
}

export interface EncryptedInfo {
    encryptedAmount: EncryptedAmount;
    incomingAmounts: EncryptedAmount[];
}

/**
 * The transaction format that is returned by the wallet proxy.
 */
export interface IncomingTransaction {
    id: string;
    blockHash: Hex;
    blockTime: string;
    total: string;
    details: TransactionDetails;
    origin: TransactionOrigin;
    encrypted?: EncryptedInfo;
    transactionHash: Hex;
    subtotal?: Hex;
    cost?: Hex;
}

export enum WalletType {
    LedgerNanoS = 'ledgernanos',
}

export interface WalletEntry {
    id: number;
    identifier: string;
    type: WalletType;
}

// Makes all properties of type T non-optional.
export type NotOptional<T> = {
    [P in keyof T]-?: T[P];
};

export type MakeRequired<T, K extends keyof T> = NotOptional<Pick<T, K>> &
    Omit<T, K>;

/**
 * @description
 * Object where keys and values are the same. Useful for storing names of form fields, and other things.
 *
 * @example
 * const equal: EqualRecord<{ name: string, address: string }> = { name: 'name', address: 'address' };
 */
export type EqualRecord<T> = { [P in keyof T]: P };

export interface EncryptionMetaData {
    keyLen: number;
    iterations: number;
    salt: string;
    initializationVector: string;
    encryptionMethod: string;
    keyDerivationMethod: string;
    hashAlgorithm: string;
}

export interface EncryptedData {
    cipherText: string;
    metadata: EncryptionMetaData;
}

export interface ExportData {
    accounts: Account[];
    identities: Identity[];
    addressBook: AddressBookEntry[];
    credentials: Credential[];
    externalCredentials: ExternalCredential[];
    wallets: WalletEntry[];
    genesis?: Genesis;
}

interface RejectReasonWithContents {
    tag: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contents: any;
}

export type ClassName = Pick<HTMLAttributes<HTMLElement>, 'className'>;
export type Style = Pick<HTMLAttributes<HTMLElement>, 'style'>;

export type ClassNameAndStyle = ClassName & Style;

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithRef on its own
export type PropsOf<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
> = JSX.LibraryManagedAttributes<C, React.ComponentPropsWithRef<C>>;

export type AsProp<C extends React.ElementType> = {
    /**
     * An override of the default HTML tag.
     * Can also be another React component.
     */
    as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<
    ExtendedProps = {},
    OverrideProps = {}
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<
    C extends React.ElementType,
    Props = {}
> = ExtendableProps<PropsOf<C>, Props>;

/**
 * @description
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included. Used for polymorphic components.
 *
 * @example
 * type ButtonProps<TAs extends ElementType = 'button'> = PolymorphicComponentProps<TAs, { p1: string, p2?: number }>;
 *
 * function Button<TAs extends ElementType = 'button'>({ p1, p2, as, ...props }: ButtonProps<TAs>) {
 *   const Component = as || 'button';
 *
 *   return <Component {...props} />;
 * }
 */
export type PolymorphicComponentProps<
    C extends React.ElementType,
    Props = {}
> = InheritableElementProps<C, Props & AsProp<C>>;

export type StateUpdate<Type> = React.Dispatch<React.SetStateAction<Type>>;

export enum TransactionTypes {
    UpdateInstruction,
    AccountTransaction,
}

interface AccountCredentialWithoutProofs extends CredentialDeploymentValues {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commitments: any;
}

export interface GenesisAccount {
    generatedAddress: string;
    credential: Typed<AccountCredentialWithoutProofs>;
}

export enum ExportKeyType {
    Root = 'root',
    Level1 = 'level1',
    Level2 = 'level2',
    Credential = 'credential',
    // eslint-disable-next-line no-shadow
    Genesis = 'genesis',
}

/**
 * Model for the export of governance keys. It contains the
 * actual key, a signature on that key, the type of key and
 * an optional note that a user can append to the export.
 */
export interface PublicKeyExportFormat {
    key: VerifyKey;
    signature: string;
    type: ExportKeyType;
    note?: string;
}

export interface SignedIdRequest {
    idObjectRequest: Versioned<IdObjectRequest>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    randomness: Hex;
}

export interface CredentialExportFormat {
    credential: CredentialDeploymentInformation;
    address: string;
}

export type ValidationRules = Omit<
    RegisterOptions,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs'
>;

/**
 * Object that contains the keys, which are needed to create a new credential.
 */
export interface CreationKeys {
    prfKey: string;
    idCredSec: string;
    publicKey: string;
}

export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;

export enum PrintErrorTypes {
    Cancelled = 'cancelled',
    Failed = 'failed',
    NoPrinters = 'no valid printers available',
}

export type PrivateKeys = {
    idCredSec: Buffer;
    prfKey: Buffer;
};

export type AccountAndCredentialPairs = {
    account: Account;
    credential: Credential;
}[];

export enum NodeConnectionStatus {
    Pinging = 'Pinging',
    CatchingUp = 'Catching up',
    Ready = 'Ready',
    Unavailable = 'Unavailable',
}

export enum TransactionOrder {
    Ascending = 'ascending',
    Descending = 'descending',
}

export interface DecryptedAmount {
    transactionHash: string;
    amount: string;
}

export interface CredentialNumberPrfKey {
    prfKeySeed: string;
    credentialNumber: number;
}

export declare type DeepPartial<T> = T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {
          [key in keyof T]: T[key];
      }
    ? {
          [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;
