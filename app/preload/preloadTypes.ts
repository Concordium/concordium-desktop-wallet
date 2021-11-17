/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountInfo,
    BlockSummary,
    ConsensusStatus,
    CryptographicParameters,
    NextAccountNonce,
    TransactionStatus,
    Versioned,
} from '@concordium/node-sdk';
import {
    OpenDialogOptions,
    OpenDialogReturnValue,
    Rectangle,
    SaveDialogOptions,
    SaveDialogReturnValue,
} from 'electron';
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
    IpInfo,
    ArInfo,
} from '~/utils/types';
import { ExternalCredential } from '../database/types';
import type LedgerCommands from './preloadLedgerTypes';

export type { default as LedgerCommands } from './preloadLedgerTypes';

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
        global: Versioned<CryptographicParameters>;
    };
};

type ConsensusAndGlobalResultFailure = {
    successful: false;
    error: Error;
};

export type ConsensusAndGlobalResult =
    | ConsensusAndGlobalResultSuccess
    | ConsensusAndGlobalResultFailure;

export type GRPC = {
    setLocation: (address: string, port: string) => void;
    nodeConsensusAndGlobal: (
        address: string,
        port: string
    ) => Promise<ConsensusAndGlobalResult>;
    sendTransaction: (
        transactionPayload: Uint8Array,
        networkId: number
    ) => Promise<boolean>;
    getCryptographicParameters: (
        blockHash: string
    ) => Promise<Versioned<CryptographicParameters> | undefined>;
    getConsensusStatus: () => Promise<ConsensusStatus>;
    getTransactionStatus: (
        transactionId: string
    ) => Promise<TransactionStatus | undefined>;
    getNextAccountNonce: (
        address: string
    ) => Promise<NextAccountNonce | undefined>;
    getBlockSummary: (blockHash: string) => Promise<BlockSummary | undefined>;
    getAccountInfo: (
        address: string,
        blockHash: string
    ) => Promise<AccountInfo | undefined>;
    getIdentityProviders: (blockHash: string) => Promise<IpInfo[] | undefined>;
    getAnonymityRevokers: (blockHash: string) => Promise<ArInfo[] | undefined>;
    // We return a Uint8Array here, because PeerListResponse must be manually serialized/deserialized.
    getPeerList: (includeBootstrappers: boolean) => Promise<Uint8Array>;
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
    selectFirst: (tableName: string) => Promise<any>;
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
    rejectIdentityAndInitialAccount: (identityId: number) => Promise<void>;
    removeIdentityAndInitialAccount: (identityId: number) => Promise<void>;
    confirmIdentity: (
        identityId: number,
        identityObjectJson: string,
        accountAddress: string,
        credential: Credential,
        addressBookEntry: AddressBookEntry
    ) => Promise<void>;
    insertPendingIdentityAndInitialAccount: (
        identity: Partial<Identity>,
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
        keys: Record<string, CredentialNumberPrfKey>
    ) => Promise<void>;
    multiple: (
        fileName: string,
        accounts: Account[],
        filters: TransactionFilter,
        global: Global,
        keys: Record<string, CredentialNumberPrfKey>
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
    printElement: (body: string) => any;
    writeImageToClipboard: (dataUrl: string) => void;
    openUrl: (href: string) => any;
    removeAllListeners: (channel: string) => void;
    platform: NodeJS.Platform;
    autoUpdate: AutoUpdateMethods;
    accountReport: AccountReportMethods;
}
