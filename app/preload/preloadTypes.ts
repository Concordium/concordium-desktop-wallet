import type {
    AccountTransactionHeader,
    AccountTransactionSignature,
    BakerId,
    ConsensusStatus,
    CryptographicParameters,
    // Referenced in jsdoc
    /* eslint-disable @typescript-eslint/no-unused-vars */
    BakerPoolStatus,
    HealthCheckResponse,
    PassiveDelegationStatus,
    RewardStatus,
    UpdateInstruction,
    NextUpdateSequenceNumbers,
    NextAccountNonce,
    ChainParameters,
    AccountInfo,
    BlockItemStatus,
    BlockItemSummaryInBlock,
    TransactionHash,
    IpInfo,
    ArInfo,
    /* eslint-enable @typescript-eslint/no-unused-vars */
} from '@concordium/web-sdk';
import { CredentialDeploymentTransaction } from '@concordium/web-sdk-v6';

import {
    TokenId,
    // Referenced in jsdoc
    /* eslint-disable @typescript-eslint/no-unused-vars */
    TokenInfo,
} from '@concordium/web-sdk/plt';
import {
    OpenDialogOptions,
    OpenDialogReturnValue,
    Rectangle,
    SaveDialogOptions,
    SaveDialogReturnValue,
    MessageBoxOptions,
    MessageBoxReturnValue,
} from 'electron';
import { Logger } from 'winston';
import type { Buffer } from 'buffer/';
import {
    Account,
    Identity,
    AddressBookEntry,
    Credential,
    EncryptedData,
    MakeOptional,
    TransferTransaction,
    Global,
    MultiSignatureTransaction,
    Setting,
    TransactionKindString,
    Hex,
    WalletType,
    IdentityProvider,
    IncomingTransaction,
    AccountAndCredentialPairs,
    TransactionFilter,
    TransactionOrder,
    DecryptedAmount,
    CredentialNumberPrfKey,
    IdentityVersion,
    DecryptedTransferTransaction,
} from '~/utils/types';
import { ExternalCredential } from '../database/types';
import type LedgerCommands from './preloadLedgerTypes';

export type { default as LedgerCommands } from './preloadLedgerTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener = (event: any, ...args: any[]) => void;
type PutListener = (callback: Listener) => void;
type PutListenerWithUnsub = (callback: Listener) => () => void;

export interface Listen {
    openRoute: PutListener;
    readyToShow: PutListener;
    didFinishLoad: PutListener;
    ledgerChannel: PutListener;
    logFromMain: PutListener;
}

export interface Once {
    onAwaitVerificationKey: PutListener;
    onVerificationKeysConfirmed: PutListener;
}

type ConsensusAndGlobalResultSuccess = {
    successful: true;
    response: {
        consensusStatus: ConsensusStatus;
        global: CryptographicParameters;
    };
};

type ConsensusAndGlobalResultFailure = {
    successful: false;
    error: Error;
};

export type ConsensusAndGlobalResult =
    | ConsensusAndGlobalResultSuccess
    | ConsensusAndGlobalResultFailure;

type GetAccountInfo = (address: string, blockHash?: string) => Promise<string>;

// TODO: ensure that messsages sent through exposed functions are properly serialized
export type GRPC = {
    setLocation: (address: string, port: string, useSsl: boolean) => void;
    /**
     * @returns stringified {@linkcode ConsensusAndGlobalResult}
     */
    nodeConsensusAndGlobal: (
        address: string,
        port: string,
        useSsl: boolean
    ) => Promise<string>;
    /**
     * @returns stringified {@linkcode TransactionHash.Type}
     */
    sendAccountTransaction: (
        header: AccountTransactionHeader,
        energyCost: bigint,
        payload: Buffer,
        signature: AccountTransactionSignature
    ) => Promise<string>;
    /**
     * @returns stringified {@linkcode TransactionHash.Type}
     */
    sendUpdateInstruction: (
        updateInstructionTransaction: UpdateInstruction,
        signatures: Record<number, string>
    ) => Promise<string>;
    /**
     * @returns stringified {@linkcode TransactionHash.Type}
     */
    sendCredentialDeploymentTransaction: (
        transaction: CredentialDeploymentTransaction,
        signatures: string[]
    ) => Promise<string>;

    /* sendCredentialDeploymentTransactionV6: (
        transaction: CredentialDeploymentTransactionv6,
        signatures: string[]
    ) => Promise<string>; */

    /**
     * @returns stringified {@linkcode CryptographicParameters}
     */
    getCryptographicParameters: (blockHash: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode ConsensusStatus}
     */
    getConsensusStatus: () => Promise<string>;
    /**
     * @returns stringified {@linkcode BlockItemStatus}
     */
    getTransactionStatus: (transactionId: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode BlockItemSummaryInBlock}
     */
    waitForTransactionFinalization: (
        transactionId: string,
        timeoutms?: number
    ) => Promise<string>;
    /**
     * @returns stringified {@linkcode NextAccountNonce}
     */
    getNextAccountNonce: (address: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode ChainParameters}
     */
    getBlockChainParameters: (blockHash?: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode NextUpdateSequenceNumbers}
     */
    getNextUpdateSequenceNumbers: (blockHash?: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode AccountInfo}
     */
    getAccountInfoOfCredential: GetAccountInfo;
    /**
     * @returns stringified {@linkcode AccountInfo}
     */
    getAccountInfo: GetAccountInfo;
    /**
     * @returns stringified {@linkcode IpInfo[]}
     */
    getIdentityProviders: (blockHash: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode ArInfo[]}
     */
    getAnonymityRevokers: (blockHash: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode TokenInfo[]}
     */
    getTokenInfo: (tokenId: TokenId.Type) => Promise<string>;
    /**
     * @returns stringified {@linkcode HealthCheckResponse}
     */
    healthCheck: () => Promise<string>;
    /**
     * @returns stringified {@linkcode RewardStatus}
     */
    getRewardStatus: (blockHash?: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode BakerPoolStatus}
     */
    getPoolInfo: (bakerId: BakerId, blockHash?: string) => Promise<string>;
    /**
     * @returns stringified {@linkcode PassiveDelegationStatus}
     */
    getPassiveDelegationInfo: (blockHash?: string) => Promise<string>;
};

export type FileMethods = {
    databaseExists: () => Promise<boolean>;
    saveFile: (filepath: string, data: string | Buffer) => Promise<boolean>;
    saveFileDialog: (opts: SaveDialogOptions) => Promise<SaveDialogReturnValue>;
    openFileDialog: (opts: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
};

export interface DecryptionData {
    data: string;
    error?: never;
}
interface DecryptionError {
    data?: never;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
}
export type DecryptionResult = DecryptionData | DecryptionError;

export type CryptoMethods = {
    encrypt: (data: string, password: string) => EncryptedData;
    decrypt: (data: EncryptedData, password: string) => DecryptionResult;
    sha256: (data: (string | Buffer | Uint8Array)[]) => Buffer;
};

export type GetTransactionsResult = {
    transactions: IncomingTransaction[];
    full: boolean;
    minId?: string;
    maxId?: string;
};

export interface HttpGetResponse<T> {
    data: T;
    headers: Record<string, string>;
    status: number;
}

export type HttpMethods = {
    get: <T>(
        urlString: string,
        params: Record<string, string>
    ) => Promise<HttpGetResponse<T>>;
    getTransactions: (
        address: string,
        transactionFilter: TransactionFilter,
        limit: number,
        order: TransactionOrder,
        id?: string
    ) => Promise<GetTransactionsResult>;
    getIdProviders: () => Promise<IdentityProvider[]>;
    gtuDrop: (address: string) => Promise<string>;
};

export type GeneralMethods = {
    rekeyDatabase: (
        oldPassword: string,
        newPassword: string
    ) => Promise<boolean>;
    checkAccess: () => Promise<boolean>;
    setPassword: (password: string) => void;
    invalidateKnexSingleton: () => void;
    migrate: () => Promise<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectFirst: (tableName: string) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectAll: (tableName: string) => Promise<any>;
};

export type AccountMethods = {
    getAll: () => Promise<Account[]>;
    getAccount: (address: string) => Promise<Account | undefined>;
    insertAccount: (account: Account | Account[]) => Promise<number[]>;
    removeAccount: (address: string) => Promise<number>;
    updateAccount: (
        address: string,
        values: Partial<Account>
    ) => Promise<number>;
    findAccounts: (condition: Partial<Account>) => Promise<Account[]>;
    updateInitialAccount: (
        identityNumber: number,
        values: Partial<Account>
    ) => Promise<number>;
    insertFromRecoveryNewIdentity: (
        recovered: AccountAndCredentialPairs,
        identity: Omit<Identity, 'id'>
    ) => Promise<void>;
    insertFromRecoveryExistingIdentity: (
        recovered: AccountAndCredentialPairs
    ) => Promise<void>;
};

export type AddressBookMethods = {
    getAll: () => Promise<AddressBookEntry[]>;
    insert: (entry: AddressBookEntry | AddressBookEntry[]) => Promise<number[]>;
    update: (
        address: string,
        values: Partial<AddressBookEntry>
    ) => Promise<number>;
    remove: (entry: Partial<AddressBookEntry>) => Promise<number>;
    findEntries: (
        condition: Partial<AddressBookEntry>
    ) => Promise<AddressBookEntry[]>;
};

export type CredentialMethods = {
    insert: (cred: Credential) => Promise<number[]>;
    delete: (cred: Partial<Credential>) => Promise<number>;
    deleteForAccount: (address: string) => Promise<number>;
    getAll: () => Promise<Credential[]>;
    getForIdentity: (identityId: number) => Promise<Credential[]>;
    getForAccount: (address: string) => Promise<Credential[]>;
    getNextNumber: (identityId: number) => Promise<number>;
    updateIndex: (
        credId: string,
        credentialIndex: number | undefined
    ) => Promise<number>;
    update: (
        credId: string,
        updatedValues: Partial<Credential>
    ) => Promise<number>;
    hasDuplicateWalletId: (
        accountAddress: string,
        credId: string,
        otherCredIds: string[]
    ) => Promise<boolean>;
    hasExistingCredential: (
        accountAddress: string,
        currentWalletId: number
    ) => Promise<boolean>;
};

export type ExternalCredentialMethods = {
    upsertExternalCredential: (
        credentials: MakeOptional<ExternalCredential, 'note'>
    ) => Promise<number[]>;
    upsertMultipleExternalCredentials: (
        credentials: MakeOptional<ExternalCredential, 'note'>[]
    ) => Promise<number[] | undefined>;
    deleteExternalCredentials: (
        credIds: string[]
    ) => Promise<number | undefined>;
    getAllExternalCredentials: () => Promise<ExternalCredential[]>;
};

export type IdentityMethods = {
    getNextIdentityNumber: (walletId: number) => Promise<number>;
    insert: (identity: Partial<Identity> | Identity[]) => Promise<number[]>;
    update: (id: number, updatedValues: Partial<Identity>) => Promise<number>;
    getIdentitiesForWallet: (walletId: number) => Promise<Identity[]>;
    rejectIdentityAndInitialAccount: (
        identityId: number,
        detail: string
    ) => Promise<void>;
    removeIdentityAndInitialAccount: (identityId: number) => Promise<void>;
    confirmIdentity: (
        identityId: number,
        identityObjectJson: string,
        accountAddress: string,
        credential: Credential,
        addressBookEntry: AddressBookEntry
    ) => Promise<void>;
    insertPendingIdentityAndInitialAccount: (
        identity: Omit<Identity, 'id'>,
        initialAccount: Omit<Account, 'identityId'>
    ) => Promise<number>;
};

export type GenesisAndGlobalMethods = {
    setValue: (genesisBlock: string, global: Global) => Promise<void>;
};

export type MultiSignatureTransactionMethods = {
    insert: (
        transaction: Partial<MultiSignatureTransaction>
    ) => Promise<number[]>;
    update: (
        transaction: MultiSignatureTransaction
    ) => Promise<number | undefined>;
    getMaxOpenNonceOnAccount: (address: string) => Promise<bigint>;
};

export interface PreferenceAccessor<V = string> {
    get(): Promise<V | null>;
    set(v: V): Promise<void>;
}

export interface PreferencesMethods {
    defaultAccount: PreferenceAccessor<Hex>;
    accountSimpleView: PreferenceAccessor<boolean>;
}

export type SettingsMethods = {
    update: (setting: Setting) => Promise<number>;
};

export interface GetTransactionsOutput {
    transactions: TransferTransaction[];
    more: boolean;
}

export type TransactionMethods = {
    getPending: () => Promise<TransferTransaction[]>;
    hasPending: (address: string) => Promise<boolean>;
    getFilteredPendingTransactions: (
        address: string,
        filteredTypes: TransactionKindString[],
        fromDate?: Date,
        toDate?: Date
    ) => Promise<TransferTransaction[]>;
    hasPendingShieldedBalanceTransfer: (address: string) => Promise<boolean>;
    update: (
        identifier: Record<string, unknown>,
        updatedValues: Partial<TransferTransaction>
    ) => Promise<number>;
    insert: (
        transactions: TransferTransaction[]
    ) => Promise<TransferTransaction[]>;
    getTransaction: (id: string) => Promise<TransferTransaction | undefined>;
    deleteTransaction: (transactionHash: string) => Promise<number>;
};

export type WalletMethods = {
    getWalletId: (identifier: Hex) => Promise<number | undefined>;
    insertWallet: (identifier: Hex, type: WalletType) => Promise<number>;
};

export type DecryptedAmountsMethods = {
    insert: (entry: DecryptedAmount) => Promise<number[]>;
    findEntries: (transactionHashes: string[]) => Promise<DecryptedAmount[]>;
};

export enum ViewResponseStatus {
    Success,
    Error,
    Aborted,
}

interface ViewResponseSuccess {
    result: string;
    status: ViewResponseStatus.Success;
}

interface ViewResponseError {
    error: string;
    status: ViewResponseStatus.Error;
}

interface ViewResponseAborted {
    status: ViewResponseStatus.Aborted;
}

export type ViewResponse =
    | ViewResponseSuccess
    | ViewResponseError
    | ViewResponseAborted;

export type BrowserViewMethods = {
    createView: (location: string, rect: Rectangle) => Promise<ViewResponse>;
    removeView: () => void;
    resizeView: (rect: Rectangle) => void;
};

export type Database = {
    general: GeneralMethods;
    account: AccountMethods;
    addressBook: AddressBookMethods;
    credentials: CredentialMethods;
    externalCredential: ExternalCredentialMethods;
    identity: IdentityMethods;
    genesisAndGlobal: GenesisAndGlobalMethods;
    multiSignatureTransaction: MultiSignatureTransactionMethods;
    preferences: PreferencesMethods;
    settings: SettingsMethods;
    transaction: TransactionMethods;
    wallet: WalletMethods;
    decyptedAmounts: DecryptedAmountsMethods;
};

export type PutLog = (
    ...inputs: [string] | [Error, string] | [Error]
) => Logger;

export type LoggingMethods = {
    info: PutLog;
    warn: PutLog;
    error: PutLog;
};

export interface AutoUpdateMethods {
    onUpdateAvailable: PutListenerWithUnsub;
    onUpdateDownloaded: PutListenerWithUnsub;
    onVerificationSuccess: PutListenerWithUnsub;
    onError: PutListenerWithUnsub;
    triggerUpdate(): void;
    quitAndInstall(): void;
}

export interface AccountReportMethods {
    single: (
        fileName: string,
        account: Account,
        filters: TransactionFilter,
        global: Global,
        keys: Record<string, CredentialNumberPrfKey>,
        decryptFunction: (
            encryptedTransfers: TransferTransaction[],
            accountAddress: string,
            prfKey: string,
            identityVersion: IdentityVersion,
            credentialNumber: number,
            global: Global
        ) => Promise<DecryptedTransferTransaction[]>,
        convertToCcd: boolean
    ) => Promise<void>;
    multiple: (
        fileName: string,
        accounts: Account[],
        filters: TransactionFilter,
        global: Global,
        keys: Record<string, CredentialNumberPrfKey>,
        decryptFunction: (
            encryptedTransfers: TransferTransaction[],
            accountAddress: string,
            prfKey: string,
            identityVersion: IdentityVersion,
            credentialNumber: number,
            global: Global
        ) => Promise<DecryptedTransferTransaction[]>,
        convertToCcd: boolean
    ) => Promise<void>;
    abort: () => void;
}

export interface WindowFunctions {
    addListener: Listen;
    removeListener: Listen;
    once: Once;
    grpc: GRPC;
    cryptoMethods: CryptoMethods;
    database: Database;
    ledger: LedgerCommands;
    files: FileMethods;
    http: HttpMethods;
    view: BrowserViewMethods;
    log: LoggingMethods;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    printElement: (body: string) => any;
    writeImageToClipboard: (dataUrl: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openUrl: (href: string) => any;
    removeAllListeners: (channel: string) => void;
    platform: NodeJS.Platform;
    autoUpdate: AutoUpdateMethods;
    accountReport: AccountReportMethods;
    messageBox: (opts: MessageBoxOptions) => Promise<MessageBoxReturnValue>;
}
