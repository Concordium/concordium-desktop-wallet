/* eslint-disable @typescript-eslint/ban-types */
import { Dispatch as GenericDispatch, AnyAction } from 'redux';
import { HTMLAttributes } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { RejectReason } from './node/RejectReasonHelper';
import { Genesis } from '~/database/types';

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
export enum ChosenAttributesKeys {
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

export type ChosenAttributes = {
    [P in keyof typeof ChosenAttributesKeys]: string;
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
    Pending = 'pending',
    // eslint-disable-next-line no-shadow
    Genesis = 'genesis',
}

/**
 * This Interface models the structure of the identities stored in the database.
 */
export interface Identity {
    id: number;
    identityNumber: number;
    name: string;
    identityObject: string;
    status: IdentityStatus;
    detail: string;
    codeUri: string;
    identityProvider: string;
    randomness: string;
    walletId: number;
}

// Statuses that an account can have.
export enum AccountStatus {
    Confirmed = 'confirmed',
    Rejected = 'rejected',
    Pending = 'pending',
    // eslint-disable-next-line no-shadow
    Genesis = 'genesis',
}

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
    rewardFilter: string;
    selfAmounts?: string;
    maxTransactionId: number;
    deploymentTransactionId?: string;
    isInitial: boolean;
}

export enum TransactionKindString {
    DeployModule = 'deployModule',
    InitContract = 'initContract',
    Update = 'update',
    Transfer = 'transfer',
    AddBaker = 'addBaker',
    RemoveBaker = 'removeBaker',
    UpdateBakerStake = 'updateBakerStake',
    UpdateBakerRestakeEarnings = 'updateBakerRestakeEarnings',
    UpdateBakerKeys = 'updateBakerKeys',
    UpdateCredentialKeys = 'updateCredentialKeys',
    BakingReward = 'bakingReward',
    BlockReward = 'blockReward',
    FinalizationReward = 'finalizationReward',
    EncryptedAmountTransfer = 'encryptedAmountTransfer',
    TransferToEncrypted = 'transferToEncrypted',
    TransferToPublic = 'transferToPublic',
    TransferWithSchedule = 'transferWithSchedule',
    UpdateCredentials = 'updateCredentials',
    RegisterData = 'registerData',
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
    | UpdateBakerRestakeEarningsPayload;

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

export type ScheduledTransfer = AccountTransaction<ScheduledTransferPayload>;

export type SimpleTransfer = AccountTransaction<SimpleTransferPayload>;
export type EncryptedTransfer = AccountTransaction<EncryptedTransferPayload>;
export type TransferToEncrypted = AccountTransaction<TransferToEncryptedPayload>;
export type UpdateAccountCredentials = AccountTransaction<UpdateAccountCredentialsPayload>;
export type TransferToPublic = AccountTransaction<TransferToPublicPayload>;
export type AddBaker = AccountTransaction<AddBakerPayload>;
export type UpdateBakerKeys = AccountTransaction<UpdateBakerKeysPayload>;
export type RemoveBaker = AccountTransaction<RemoveBakerPayload>;
export type UpdateBakerStake = AccountTransaction<UpdateBakerStakePayload>;
export type UpdateBakerRestakeEarnings = AccountTransaction<UpdateBakerRestakeEarningsPayload>;

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

export interface Credential {
    accountAddress: string;
    credentialIndex?: number;
    credentialNumber: number;
    identityId: number;
    identityNumber?: number;
    walletId?: number;
    credId: Hex;
    policy: JSONString;
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

// Statuses that a transaction can have.
export enum TransactionStatus {
    Finalized = 'finalized',
    Committed = 'committed',
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
    remote: boolean;
    originType: OriginType;
    transactionKind: TransactionKindString;
    id?: number; // only remote transactions have ids.
    blockHash: Hex;
    blockTime: string;
    success?: boolean;
    transactionHash: Hex;
    subtotal?: string;
    cost?: string;
    details?: string;
    encrypted?: string;
    schedule?: string;
    fromAddress: Hex;
    toAddress: Hex;
    status: TransactionStatus;
    rejectReason?: RejectReason | string;
    fromAddressName?: string;
    toAddressName?: string;
    decryptedAmount?: string;
    origin?: string;
}

export type EncryptedAmount = Hex;

export interface AccountEncryptedAmount {
    selfAmount: EncryptedAmount;
    incomingAmounts: EncryptedAmount[];
    startIndex: number;
    numAggregated?: number;
}

export interface TypedCredentialDeploymentInformation {
    contents: CredentialDeploymentInformation;
    type: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccountReleaseSchedule = any; // TODO

interface AccountBakerDetails {
    restakeEarnings: boolean;
    bakerId: number;
    bakerAggregationVerifyKey: string;
    bakerElectionVerifyKey: string;
    bakerSignatureVerifyKey: string;
    stakedAmount: string;
    pendingChange?: BakerPendingChange;
}

export type BakerPendingChange =
    | {
          change: 'ReduceStake';
          newStake: string;
          epoch: number;
      }
    | {
          change: 'RemoveBaker';
          epoch: number;
      };

// Reflects the structure given by the node,
// in a getAccountInforequest
export interface AccountInfo {
    accountAmount: string;
    accountEncryptionKey: string;
    accountThreshold: number;
    accountReleaseSchedule: AccountReleaseSchedule;
    accountBaker?: AccountBakerDetails;
    accountEncryptedAmount: AccountEncryptedAmount;
    accountCredentials: Record<
        number,
        Versioned<TypedCredentialDeploymentInformation>
    >;
    accountIndex: number;
}

// Reflects the type, which the account Release Schedule is comprised of.
export interface ScheduleItem {
    amount: string;
    transactions: Hex[];
    timestamp: string;
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
    | MintDistribution
    | ProtocolUpdate
    | GasRewards
    | BakerStakeThreshold
    | ElectionDifficulty
    | HigherLevelKeyUpdate
    | AuthorizationKeysUpdate;

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
    return object.transactionKind === TransactionKindId.Simple_transfer;
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

export function instanceOfScheduledTransfer(
    object: AccountTransaction<TransactionPayload>
): object is ScheduledTransfer {
    return object.transactionKind === TransactionKindId.Transfer_with_schedule;
}

export function instanceOfUpdateAccountCredentials(
    object: AccountTransaction<TransactionPayload>
): object is UpdateAccountCredentials {
    return object.transactionKind === TransactionKindId.Update_credentials;
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
): object is AddBaker {
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

export function isExchangeRate(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<ExchangeRate> {
    return (
        UpdateType.UpdateMicroGTUPerEuro === transaction.type ||
        UpdateType.UpdateEuroPerEnergy === transaction.type
    );
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
    return UpdateType.UpdateMintDistribution === transaction.type;
}

export function isProtocolUpdate(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<ProtocolUpdate> {
    return UpdateType.UpdateProtocol === transaction.type;
}

export function isGasRewards(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<GasRewards> {
    return UpdateType.UpdateGASRewards === transaction.type;
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

export interface MintDistribution {
    mintPerSlot: MintRate;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

export interface ProtocolUpdate {
    message: string;
    specificationUrl: string;
    specificationHash: Hex;
    specificationAuxiliaryData: string;
}

export interface GasRewards {
    baker: RewardFraction;
    finalizationProof: RewardFraction;
    accountCreation: RewardFraction;
    chainUpdate: RewardFraction;
}

export interface BakerStakeThreshold {
    threshold: Word64;
}

export interface ElectionDifficulty {
    electionDifficulty: Word32;
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
    electionDifficulty,
    euroPerEnergy,
    microGtuPerEuro,
    foundationAccount,
    mintDistribution,
    transactionFeeDistribution,
    gasRewards,
    bakerStakeThreshold,
    addAnonymityRevoker,
    addIdentityProvider,
}

export interface AccessStructure {
    publicKeyIndicies: KeyIndexWithStatus[];
    threshold: Word16;
    type: AccessStructureEnum;
}

export enum AuthorizationKeysUpdateType {
    Level1 = 1,
    Root = 2,
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
    id: number;
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
    wallets: WalletEntry[];
    genesis?: Genesis;
}

interface RejectReasonWithContents {
    tag: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contents: any;
}

interface EventResult {
    outcome: string;
    rejectReason?: RejectReasonWithContents;
}

export interface TransactionEvent {
    result: EventResult;
    cost: string;
}

export interface Action {
    label: string;
    location?: string;
}

export type ClassName = Pick<HTMLAttributes<HTMLElement>, 'className'>;

export type ClassNameAndStyle = Pick<
    HTMLAttributes<HTMLElement>,
    'style' | 'className'
>;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    idObjectRequest: any;
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
