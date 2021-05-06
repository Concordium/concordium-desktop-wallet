/* eslint-disable @typescript-eslint/ban-types */
import { Dispatch as GenericDispatch, AnyAction } from 'redux';
import { HTMLAttributes } from 'react';

export type Dispatch = GenericDispatch<AnyAction>;

export type Hex = string;
type Proofs = Hex;
type Word64 = bigint;
type Word32 = number;
export type Word8 = number;
type JSONString = string; // indicates that it is some object that has been stringified.

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

export interface TransferToEncryptedPayload {
    amount: string;
}

export interface TransferToPublicPayload {
    transferAmount: string;
    remainingEncryptedAmount?: EncryptedAmount;
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
}

export interface UpdateAccountCredentialsPayload {
    addedCredentials: AddedCredential[];
    removedCredIds: Hex[];
    threshold: number;
}

export type TransactionPayload =
    | UpdateAccountCredentialsPayload
    | TransferToPublicPayload
    | TransferToEncryptedPayload
    | ScheduledTransferPayload
    | SimpleTransferPayload;

// Structure of an accountTransaction, which is expected
// the blockchain's nodes
export interface AccountTransaction<
    PayloadType extends TransactionPayload = TransactionPayload
> {
    sender: Hex;
    nonce: string;
    energyAmount: string;
    estimatedFee?: Fraction;
    expiry: bigint;
    transactionKind: TransactionKindId;
    payload: PayloadType;
}

export type ScheduledTransfer = AccountTransaction<ScheduledTransferPayload>;

export type SimpleTransfer = AccountTransaction<SimpleTransferPayload>;
export type TransferToEncrypted = AccountTransaction<TransferToEncryptedPayload>;
export type UpdateAccountCredentials = AccountTransaction<UpdateAccountCredentialsPayload>;
export type TransferToPublic = AccountTransaction<TransferToPublicPayload>;

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

// Possible Reasons for a transaction to fail on the blockchain.
// Should be kept in sync with `RejectReason` found in
// <https://gitlab.com/Concordium/concordium-base/-/blob/master/haskell-src/Concordium/Types/Execution.hs#L653>
export enum RejectReason {
    ModuleNotWF = 'Smart contract module failed to typecheck',
    ModuleHashAlreadyExists = 'A module with this hash already exists',
    InvalidAccountReference = 'Referenced account does not exists',
    InvalidModuleReference = 'Referenced module does not exists',
    InvalidContractAddress = 'No smart contract instance exists with the given contract address ',
    ReceiverAccountNoCredential = 'The receiving account has no valid credential',
    ReceiverContractNoCredential = 'The receiving smart contract instance has no valid credential',
    AmountTooLarge = 'Insufficient funds',
    SerializationFailure = 'The transaction body was malformed',
    OutOfEnergy = 'The transaction ran out of energy',
    Rejected = 'Rejected by contract logic',
    NonExistentRewardAccount = 'The designated reward account does not exist',
    InvalidProof = 'Proof that the baker owns relevant private keys is not valid',
    InvalidInitMethod = 'Invalid Initial method, no such contract found in module ',
    InvalidReceiveMethod = 'Invalid receive function in module, missing receive function in contract',
    RuntimeFailure = 'Runtime failure when executing smart contract',
    DuplicateAggregationKey = 'Duplicate aggregation key',
    NonExistentAccountKey = 'Encountered index to which no account key belongs when removing or updating keys',
    KeyIndexAlreadyInUse = 'The requested key index is already in use',
    InvalidAccountKeySignThreshold = 'The requested sign threshold would exceed the number of keys on the account',
    InvalidEncryptedAmountTransferProof = 'The shielded amount transfer has an invalid proof',
    EncryptedAmountSelfTransfer = 'An shielded amount transfer from the account to itself is not allowed',
    InvalidTransferToPublicProof = 'The shielding has an invalid proof',
    InvalidIndexOnEncryptedTransfer = 'The provided shielded transfer index is out of bounds',
    ZeroScheduledAmount = 'Attempt to transfer 0 GTU with schedule',
    NonIncreasingSchedule = 'Attempt to transfer amount with non-increasing schedule',
    FirstScheduledReleaseExpired = 'The first scheduled release is in the past',
    ScheduledSelfTransfer = 'Attempt to transfer from account A to A with schedule',
    AlreadyABaker = 'Baker with ID  already exists',
    NotABaker = 'Account is not a baker',
    InsufficientBalanceForBakerStake = 'Sender account has insufficient balance to cover the requested stake',
    BakerInCooldown = 'Request to make change to the baker while the baker is in the cooldown period',
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
    total: string;
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
    rejectReason?: string;
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
    stakedAmount: string;
    bakerId: string;
}

// Reflects the structure given by the node,
// in a getAccountInforequest
export interface AccountInfo {
    accountAmount: string;
    accountThreshold: number;
    accountReleaseSchedule: AccountReleaseSchedule;
    accountBaker?: AccountBakerDetails;
    accountEncryptedAmount: AccountEncryptedAmount;
    accountCredentials: Record<
        number,
        Versioned<TypedCredentialDeploymentInformation>
    >;
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
    authorizationKeyIndex: number;
    signature: string;
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
    | HigherLevelKeyUpdate;

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
    return 'signature' in object && 'authorizationKeyIndex' in object;
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
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
    return UpdateType.UpdateLevel2KeysUsingRootKeys === transaction.type;
}

export function isUpdateUsingRootKeys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
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
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
    return UpdateType.UpdateLevel2KeysUsingLevel1Keys === transaction.type;
}

export function isUpdateUsingLevel1Keys(
    transaction: UpdateInstruction<UpdateInstructionPayload>
): transaction is UpdateInstruction<HigherLevelKeyUpdate> {
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

export interface TransactionDetails {
    events: string[];
    rejectReason?: string;
    transferSource?: Hex;
    transferDestination?: Hex;
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

/**
 * The basic color types supported by Semantic UI components color property.
 */
export enum ColorType {
    Blue = 'blue',
    Olive = 'olive',
    Green = 'green',
    Red = 'red',
    Grey = 'grey',
    Orange = 'orange',
    Yellow = 'yellow',
    Teal = 'teal',
    Violet = 'violet',
    Purple = 'purple',
    Pink = 'pink',
    Brown = 'brown',
    Black = 'black',
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
    metaData: EncryptionMetaData;
}

export interface ExportData {
    accounts: Account[];
    identities: Identity[];
    addressBook: AddressBookEntry[];
    credentials: Credential[];
    wallets: WalletEntry[];
}

interface EventResult {
    outcome: string;
    rejectReason?: string;
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
