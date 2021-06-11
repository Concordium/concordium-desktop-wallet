/* eslint no-console: off, @typescript-eslint/no-var-requires: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import bs58check from 'bs58check';
import axios from 'axios';
import * as https from 'https';
import * as crypto from 'crypto';
import { Knex } from 'knex';
import ipcCommands from './constants/ipcCommands.json';
import ledgerIpcCommands from './constants/ledgerIpcCommands.json';
import ipcRendererCommands from './constants/ipcRendererCommands.json';
import { setClientLocation, grpcCall } from './node/GRPCClient';
import ConcordiumNodeClient from './node/ConcordiumNodeClient';
import { ConsensusStatus } from './node/NodeApiTypes';
import { JsonResponse } from './proto/concordium_p2p_rpc_pb';
import { getTargetNet, Net } from './utils/ConfigHelper';
import urls from './constants/urls.json';
import { walletProxytransactionLimit } from './constants/externalConstants.json';
import { getDatabaseFilename } from './database/knexfile';
import {
    Account,
    AccountTransaction,
    AddressBookEntry,
    AuthorizationKeysUpdate,
    BakerStakeThreshold,
    ElectionDifficulty,
    EncryptedData,
    ExchangeRate,
    FoundationAccount,
    GasRewards,
    Global,
    Hex,
    HigherLevelKeyUpdate,
    Identity,
    MintDistribution,
    MultiSignatureTransaction,
    ProtocolUpdate,
    PublicInformationForIp,
    Setting,
    TransactionFeeDistribution,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
    UnsignedCredentialDeploymentInformation,
    UpdateInstruction,
    WalletEntry,
    WalletType,
} from './utils/types';
import { knex, setPassword } from './database/knex';
import {
    walletTable,
    transactionTable,
    settingsTable,
    multiSignatureProposalTable,
    identitiesTable,
    globalTable,
    genesisTable,
    credentialsTable,
    addressBookTable,
    accountsTable,
} from './constants/databaseNames.json';
import migrate from './database/migration';
import { convertBooleans } from './database/TransactionDao';
import { chunkArray, partition } from './utils/basicHelpers';
import { sanitizeAddressBookEntry } from './database/AddressBookDao';
import { convertAccountBooleans } from './database/AccountDao';
import { getLedgerClient, subscribeLedger } from './ledgerObserver';
import { AccountPathInput } from './features/ledger/Path';

export default class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;

        // Disable automatic updates for now.
        // autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;
let printWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload
        )
        .catch(console.log);
};

const createWindow = async () => {
    if (process.env.DEBUG_PROD === 'true') {
        await installExtensions();
    }

    const titleSuffix = process.env.TARGET_NET || '';

    mainWindow = new BrowserWindow({
        title: `Concordium Wallet ${titleSuffix}`,
        show: false,
        width: 4096,
        height: 2912,
        webPreferences:
            process.env.NODE_ENV === 'development'
                ? {
                      preload: path.join(__dirname, 'preload.js'),
                      nodeIntegration: true,
                      webviewTag: true,
                  }
                : {
                      preload: path.join(__dirname, 'preload.js'),
                      webviewTag: true,
                      nodeIntegration: true,
                      devTools: true,
                  },
    });

    printWindow = new BrowserWindow({
        parent: mainWindow,
        modal: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            devTools: false,
        },
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }

        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }

        mainWindow.webContents.send(ipcRendererCommands.didFinishLoad);
        // Start ledger listener
        subscribeLedger(mainWindow);
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.webContents.send(ipcRendererCommands.readyToShow);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.setMenuBarVisibility(false);

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
};

function getWalletProxy() {
    const targetNet = getTargetNet();
    if (targetNet === Net.Mainnet) {
        return urls.walletProxyMainnet;
    }
    if (targetNet === Net.Testnet) {
        return urls.walletProxyTestnet;
    }
    if (targetNet === Net.Stagenet) {
        return urls.walletProxyStagenet;
    }
    throw new Error('Unknown target network');
}

const walletProxy = axios.create({
    baseURL: getWalletProxy(),
});

ipcMain.handle(ledgerIpcCommands.getPublicKey, (_event, keypath: number[]) => {
    return getLedgerClient().getPublicKey(keypath);
});

ipcMain.handle(
    ledgerIpcCommands.getPublicKeySilent,
    (_event, keypath: number[]) => {
        return getLedgerClient().getPublicKeySilent(keypath);
    }
);

ipcMain.handle(
    ledgerIpcCommands.getSignedPublicKey,
    (_event, keypath: number[]) => {
        return getLedgerClient().getSignedPublicKey(keypath);
    }
);

ipcMain.handle(ledgerIpcCommands.getIdCredSec, (_event, identity: number) => {
    return getLedgerClient().getIdCredSec(identity);
});

ipcMain.handle(ledgerIpcCommands.getPrfKey, (_event, identity: number) => {
    return getLedgerClient().getPrfKey(identity);
});

ipcMain.handle(
    ledgerIpcCommands.signTransfer,
    (_event, transaction: AccountTransaction, keypath: number[]) => {
        return getLedgerClient().signTransfer(transaction, keypath);
    }
);

ipcMain.handle(
    ledgerIpcCommands.signPublicInformationForIp,
    (
        _event,
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput
    ) => {
        return getLedgerClient().signPublicInformationForIp(
            publicInfoForIp,
            accountPathInput
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signCredentialDeploymentOnExistingAccount,
    (
        _event,
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        keypath: number[]
    ) => {
        return getLedgerClient().signCredentialDeploymentOnExistingAccount(
            credentialDeployment,
            address,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signCredentialDeploymentOnNewAccount,
    (
        _event,
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        keypath: number[]
    ) => {
        return getLedgerClient().signCredentialDeploymentOnNewAccount(
            credentialDeployment,
            expiry,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signMicroGtuPerEuro,
    (
        _event,
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signMicroGtuPerEuro(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signEuroPerEnergy,
    (
        _event,
        transaction: UpdateInstruction<ExchangeRate>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signEuroPerEnergy(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signTransactionFeeDistribution,
    (
        _event,
        transaction: UpdateInstruction<TransactionFeeDistribution>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signTransactionFeeDistribution(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signFoundationAccount,
    (
        _event,
        transaction: UpdateInstruction<FoundationAccount>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signFoundationAccount(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signMintDistribution,
    (
        _event,
        transaction: UpdateInstruction<MintDistribution>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signMintDistribution(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signProtocolUpdate,
    (
        _event,
        transaction: UpdateInstruction<ProtocolUpdate>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signProtocolUpdate(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signGasRewards,
    (
        _event,
        transaction: UpdateInstruction<GasRewards>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signGasRewards(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signBakerStakeThreshold,
    (
        _event,
        transaction: UpdateInstruction<BakerStakeThreshold>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signBakerStakeThreshold(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signElectionDifficulty,
    (
        _event,
        transaction: UpdateInstruction<ElectionDifficulty>,
        serializedPayload: Buffer,
        keypath: number[]
    ) => {
        return getLedgerClient().signElectionDifficulty(
            transaction,
            serializedPayload,
            keypath
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signHigherLevelKeysUpdate,
    (
        _event,
        transaction: UpdateInstruction<HigherLevelKeyUpdate>,
        serializedPayload: Buffer,
        keypath: number[],
        INS: number
    ) => {
        return getLedgerClient().signHigherLevelKeysUpdate(
            transaction,
            serializedPayload,
            keypath,
            INS
        );
    }
);

ipcMain.handle(
    ledgerIpcCommands.signAuthorizationKeysUpdate,
    (
        _event,
        transaction: UpdateInstruction<AuthorizationKeysUpdate>,
        serializedPayload: Buffer,
        keypath: number[],
        INS: number
    ) => {
        return getLedgerClient().signAuthorizationKeysUpdate(
            transaction,
            serializedPayload,
            keypath,
            INS
        );
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ledgerIpcCommands.getAppAndVersion, (_event) => {
    return getLedgerClient().getAppAndVersion();
});

// TODO Refactor.
ipcMain.handle('setPassword', (_event, password: string) => {
    setPassword(password);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbMigrate', (_event) => {
    migrate();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbGetAllAccounts', async (_event) => {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return convertAccountBooleans(accounts);
});

ipcMain.handle('dbGetAccount', async (_event, address: string) => {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .where({ address })
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );

    return convertAccountBooleans(accounts)[0];
});

ipcMain.handle(
    'insertAccount',
    async (_event, account: Account | Account[]) => {
        return (await knex())(accountsTable).insert(account);
    }
);

ipcMain.handle(
    'updateAccount',
    async (_event, address: string, updatedValues: Partial<Account>) => {
        return (await knex())(accountsTable)
            .where({ address })
            .update(updatedValues);
    }
);

ipcMain.handle(
    'dbFindAccounts',
    async (_event, condition: Record<string, unknown>) => {
        const accounts = await (await knex())
            .select()
            .table(accountsTable)
            .where(condition);
        return convertAccountBooleans(accounts);
    }
);

ipcMain.handle('dbRemoveAccount', async (_event, accountAddress: string) => {
    return (await knex())(accountsTable)
        .where({ address: accountAddress })
        .del();
});

ipcMain.handle('dbRemoveInitialAccount', async (_event, identityId: number) => {
    return (await knex())(accountsTable)
        .where({ identityId, isInitial: 1 })
        .del();
});

ipcMain.handle(
    'dbConfirmInitialAccount',
    async (_event, identityId: number, updatedValues: Partial<Account>) => {
        return (await knex())
            .select()
            .table(accountsTable)
            .where({ identityId, isInitial: 1 })
            .first()
            .update(updatedValues);
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbGetAddressBook', async (_event) => {
    return (await knex())
        .select()
        .table(addressBookTable)
        .orderByRaw('name COLLATE NOCASE ASC')
        .then((e) => e.map(sanitizeAddressBookEntry));
});

ipcMain.handle(
    'dbInsertAddressBookEntry',
    async (_event, entry: AddressBookEntry | AddressBookEntry[]) => {
        return (await knex())(addressBookTable).insert(entry);
    }
);

ipcMain.handle(
    'dbUpdateAddressBookEntry',
    async (
        _event,
        address: string,
        updatedValues: Partial<AddressBookEntry>
    ) => {
        return (await knex())(addressBookTable)
            .where({ address })
            .update(updatedValues);
    }
);

ipcMain.handle(
    'dbRemoveAddressBookEntry',
    async (_event, entry: Partial<AddressBookEntry>) => {
        return (await knex())(addressBookTable).where(entry).del();
    }
);

ipcMain.handle(
    'dbFindAddressBookEntries',
    async (_event, condition: Partial<AddressBookEntry>) => {
        return (await knex())
            .select()
            .table(addressBookTable)
            .where(condition)
            .then((e) => e.map(sanitizeAddressBookEntry));
    }
);

ipcMain.handle('dbInsertCredential', async (_event, credential: Credential) => {
    return (await knex())(credentialsTable).insert(credential);
});

ipcMain.handle('dbDeleteCredential', async (_event, credential: Credential) => {
    return (await knex())(credentialsTable).where(credential).del();
});

ipcMain.handle(
    'dbDeleteCredentialsForAccount',
    async (_event, accountAddress: string) => {
        return (await knex())(credentialsTable).where({ accountAddress }).del();
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbGetCredentials', async (_event) => {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .join(
            identitiesTable,
            `${credentialsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${credentialsTable}.*`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return credentials;
});

ipcMain.handle(
    'dbGetCredentialsForIdentity',
    async (_event, identityId: number) => {
        return (await knex())
            .select()
            .table(credentialsTable)
            .where({ identityId });
    }
);

async function getCredentialsOfAccount(accountAddress: string) {
    const credentials = await (await knex())
        .select()
        .table(credentialsTable)
        .join(
            identitiesTable,
            `${credentialsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .join(
            walletTable,
            `${identitiesTable}.walletId`,
            '=',
            `${walletTable}.id`
        )
        .where({ accountAddress })
        .select(
            `${credentialsTable}.*`,
            `${identitiesTable}.identityNumber as identityNumber`,
            `${walletTable}.id as walletId`
        );
    return credentials;
}

ipcMain.handle(
    'dbGetCredentialsOfAccount',
    async (_event, accountAddress: string) => {
        return getCredentialsOfAccount(accountAddress);
    }
);

ipcMain.handle(
    'dbGetNextCredentialNumber',
    async (_event, identityId: number) => {
        const credentials = await (await knex())
            .select()
            .table(credentialsTable)
            .where({ identityId });
        if (credentials.length === 0) {
            return 0;
        }
        const currentNumber = credentials.reduce(
            (num, cred) => Math.max(num, cred.credentialNumber),
            0
        );
        return currentNumber + 1;
    }
);

ipcMain.handle(
    'dbUpdateCredentialIndex',
    async (_event, credId: string, credentialIndex: number | undefined) => {
        if (credentialIndex === undefined) {
            return (await knex())(credentialsTable)
                .where({ credId })
                .update({ credentialIndex: null });
        }
        return (await knex())(credentialsTable)
            .where({ credId })
            .update({ credentialIndex });
    }
);

ipcMain.handle(
    'dbUpdateCredential',
    async (_event, credId: string, updatedValues: Partial<Credential>) => {
        return (await knex())(credentialsTable)
            .where({ credId })
            .update(updatedValues);
    }
);

ipcMain.handle(
    'dbHasDuplicateWalletId',
    async (
        _event,
        accountAddress: string,
        credId: string,
        otherCredIds: string[]
    ) => {
        const credentials = await getCredentialsOfAccount(accountAddress);
        const credential = credentials.find((cred) => cred.credId === credId);
        if (!credential) {
            return false;
        }
        const { walletId } = credential;
        const otherWalletIds = credentials
            .filter((cred) => otherCredIds.includes(cred.credId))
            .map((cred) => cred.walletId);
        return otherWalletIds.includes(walletId);
    }
);

ipcMain.handle(
    'dbHasExistingCredential',
    async (_event, accountAddress: string, currentWalletId: number) => {
        const credentials = await getCredentialsOfAccount(accountAddress);
        return credentials.some((cred) => cred.walletId === currentWalletId);
    }
);

async function setGenesis(genesisBlock: string, trx: Knex.Transaction) {
    const table = (await knex())(genesisTable).transacting(trx);
    return table.insert({ genesisBlock });
}

async function setGlobal(global: Global, trx: Knex.Transaction) {
    const table = (await knex())(globalTable).transacting(trx);
    return table.insert(global);
}

ipcMain.handle(
    'dbSetGenesisAndGlobal',
    async (_event, genesisBlock: string, global: Global) => {
        const db = await knex();
        await db.transaction((trx) => {
            setGenesis(genesisBlock, trx)
                .then(() => {
                    return setGlobal(global, trx);
                })
                .then(trx.commit)
                .catch(trx.rollback);
        });
    }
);

ipcMain.handle('dbSelectFirst', async (_event, tableName: string) => {
    return (await knex()).table(tableName).first();
});

ipcMain.handle('dbInsertIdentitiy', async (_event, identity: Identity) => {
    return (await knex())(identitiesTable).insert(identity);
});

ipcMain.handle(
    'dbUpdateIdentity',
    async (_event, id: number, updatedValues: Record<string, unknown>) => {
        return (await knex())(identitiesTable)
            .where({ id })
            .update(updatedValues);
    }
);

ipcMain.handle('dbGetIdentitiesForWallet', async (_event, walletId: number) => {
    return (await knex()).select().table(identitiesTable).where({ walletId });
});

ipcMain.handle('dbGetNextIdentityNumber', async (_event, walletId: number) => {
    const model = (await knex())
        .table(identitiesTable)
        .where('walletId', walletId);
    const totalCount = await model.clone().count();
    return parseInt(totalCount[0]['count(*)'].toString(), 10);
});

ipcMain.handle(
    'dbInsertMultiSignatureProposal',
    async (_event, transaction: Partial<MultiSignatureTransaction>) => {
        return (await knex())
            .table(multiSignatureProposalTable)
            .insert(transaction);
    }
);

ipcMain.handle(
    'dbUpdateMultiSignatureProposal',
    async (_event, multiSigTransaction: MultiSignatureTransaction) => {
        return (await knex())(multiSignatureProposalTable)
            .where({ id: multiSigTransaction.id })
            .update(multiSigTransaction);
    }
);

ipcMain.handle('dbUpdateSettingsEntry', async (_event, setting: Setting) => {
    return (await knex())(settingsTable)
        .where({ name: setting.name })
        .update(setting);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbGetPendingTransactions', async (_event) => {
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending })
        .orderBy('id');
    return convertBooleans(transactions);
});

ipcMain.handle('dbGetMaxTransactionId', async (_event, account: Account) => {
    const { address } = account;
    const query = await (await knex())
        .table<TransferTransaction>(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .max<{ maxId: TransferTransaction['id'] }>('id as maxId')
        .first();
    return query?.maxId;
});

ipcMain.handle(
    'dbGetTransactionsOfAccount',
    async (
        _event,
        account: Account,
        filteredTypes: TransactionKindString[],
        limit: number
    ) => {
        const { address } = account;
        const transactions = await (await knex())
            .select()
            .table(transactionTable)
            .whereNotIn('transactionKind', filteredTypes)
            .andWhere({ toAddress: address })
            .orWhere({ fromAddress: address })
            .orderBy('blockTime', 'desc')
            .orderBy('id', 'desc')
            .limit(limit + 1);
        return {
            transactions: convertBooleans(transactions).slice(0, limit),
            more: transactions.length > limit,
        };
    }
);

async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return (await knex())(transactionTable)
        .where(identifier)
        .update(updatedValues);
}

ipcMain.handle(
    'dbUpdateTransaction',
    async (
        _event,
        identifier: Record<string, unknown>,
        updatedValues: Partial<TransferTransaction>
    ) => {
        return updateTransaction(identifier, updatedValues);
    }
);

ipcMain.handle(
    'dbInsertTransactions',
    async (_event, transactions: Partial<TransferTransaction>[]) => {
        const table = (await knex())(transactionTable);
        const existingTransactions: TransferTransaction[] = await table.select();
        const [updates, additions] = partition(transactions, (t) =>
            existingTransactions.some(
                (t_) => t.transactionHash === t_.transactionHash
            )
        );

        const additionChunks = chunkArray(additions, 50);
        for (let i = 0; i < additionChunks.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await table.insert(additionChunks[i]);
        }

        await Promise.all(
            updates.map(async (transaction) => {
                const { transactionHash, ...otherFields } = transaction;
                return updateTransaction(
                    { transactionHash: transaction.transactionHash },
                    otherFields
                );
            })
        );

        return additions;
    }
);

ipcMain.handle(ipcCommands.dbSelectAll, async (_event, tableName: string) => {
    const table = (await knex())(tableName);
    return table.select();
});

ipcMain.handle(ipcCommands.dbGetWalletId, async (_event, identifier: Hex) => {
    const table = (await knex())(walletTable);
    const result: WalletEntry = await table
        .where('identifier', identifier)
        .first();
    if (result === undefined) {
        return undefined;
    }
    return result.id;
});

ipcMain.handle(
    ipcCommands.dbInsertWallet,
    async (_event, identifier: Hex, type: WalletType) => {
        const table = (await knex())(walletTable);
        return (await table.insert({ identifier, type }))[0];
    }
);

const encoding = 'base64';

const aes256EncryptionMethodExternal = 'AES-256';
const aes256EncryptionMethod = 'AES-256-CBC';

const keyDerivationMethodExternal = 'PBKDF2WithHmacSHA256';
const keyDerivationMethod = 'PBKDF2';

const hashAlgorithmInternal = 'sha256';

/**
 * The naming of the encryption methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getEncryptionMethodExport(method: string) {
    if (method === aes256EncryptionMethod) {
        return aes256EncryptionMethodExternal;
    }
    throw new Error(`An unsupported encryption method was used: ${method}`);
}

function getEncryptionMethodImport(method: string) {
    if (method === aes256EncryptionMethodExternal) {
        return aes256EncryptionMethod;
    }
    throw new Error(`An unsupported encryption method was used: " ${method}`);
}

/**
 * The naming of the key derivation methods across different crypto libraries are different,
 * so this method is required to output in the format expected by external tools.
 */
function getKeyDerivationAlgorithmExport(algorithm: string) {
    if (algorithm === keyDerivationMethod) {
        return keyDerivationMethodExternal;
    }
    throw new Error(
        `An unsupported key derivation algorithm was used: ${algorithm}`
    );
}

/**
 * Encrypts the data using PBKDF2 to generate a key from the password, and
 * AES-256 in CBC mode. The cipher text is returned along with the parameters
 * required to decrypt the file.
 */
function encrypt(data: string, password: string): EncryptedData {
    const keyLen = 32;
    const iterations = 10000;
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        keyLen,
        hashAlgorithmInternal
    );
    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        aes256EncryptionMethod,
        key,
        initializationVector
    );
    let cipherText = cipher.update(data, 'utf8', encoding);
    cipherText += cipher.final(encoding);
    return {
        cipherText,
        metadata: {
            keyLen,
            iterations,
            salt: salt.toString(encoding),
            initializationVector: initializationVector.toString(encoding),
            encryptionMethod: getEncryptionMethodExport(aes256EncryptionMethod),
            keyDerivationMethod: getKeyDerivationAlgorithmExport(
                keyDerivationMethod
            ),
            hashAlgorithm: hashAlgorithmInternal,
        },
    };
}

ipcMain.handle(
    ipcCommands.encrypt,
    (_event, data: string, password: string) => {
        return encrypt(data, password);
    }
);

/**
 * Decrypts the data using the metadata in the file that was given as input
 * and the provided password.
 */
export function decrypt(
    { cipherText, metadata }: EncryptedData,
    password: string
): string {
    const {
        keyLen,
        iterations,
        salt,
        initializationVector,
        encryptionMethod,
        hashAlgorithm,
    } = metadata;
    const internalEncryptionMethod = getEncryptionMethodImport(
        encryptionMethod
    );
    const key = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt, encoding),
        iterations,
        keyLen,
        hashAlgorithm
    );
    const decipher = crypto.createDecipheriv(
        internalEncryptionMethod,
        key,
        Buffer.from(initializationVector, encoding)
    );
    let data = decipher.update(cipherText, encoding, 'utf8');
    data += decipher.final('utf8');
    return data;
}

ipcMain.handle(
    ipcCommands.decrypt,
    (_event, { cipherText, metadata }: EncryptedData, password: string) => {
        return decrypt({ cipherText, metadata }, password);
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.databaseExists, async (_event) => {
    const databaseFilename = await getDatabaseFilename();
    if (!fs.existsSync(databaseFilename)) {
        return false;
    }
    const stats = fs.statSync(databaseFilename);
    return stats.size > 0;
});

ipcMain.handle(
    ipcCommands.sha256,
    async (_event, data: (Buffer | Uint8Array)[]) => {
        const hash = crypto.createHash('sha256');
        data.forEach((input) => hash.update(input));
        return hash.digest();
    }
);

ipcMain.handle(
    ipcCommands.getTransactions,
    async (_event, address: string, id: number) => {
        const response = await walletProxy.get(
            `/v0/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`
        );
        const { transactions, count, limit } = response.data;
        return { transactions, full: count === limit };
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.getIdProviders, async (_event) => {
    const response = await walletProxy.get('/v0/ip_info');
    return response.data;
});

ipcMain.handle(
    ipcCommands.httpGet,
    (_event, urlString: string, params: Record<string, string>) => {
        const url = new URL(urlString);
        const searchParams = new URLSearchParams(params);
        url.searchParams.forEach((value, name) =>
            searchParams.append(name, value)
        );
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: `${url.pathname}?${searchParams.toString()}`,
            timeout: 60000,
        };
        return new Promise((resolve) => {
            https.get(options, (res) => resolve(res));
        });
    }
);

ipcMain.handle(ipcCommands.createAxios, (_event, baseUrl) => {
    return axios.create({
        baseURL: baseUrl,
    });
});

ipcMain.handle(ipcCommands.decodeBase58, (_event, address: string) => {
    try {
        // This call throws an error if the input is not a valid
        const decoded = bs58check.decode(address);
        return { successful: true, decoded };
    } catch (e) {
        return { successful: false, error: e };
    }
});

ipcMain.handle(ipcCommands.isValidBase58, (_event, address: string) => {
    try {
        // This call throws an error if the input is not a valid
        bs58check.decode(address);
    } catch (e) {
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
});

ipcMain.handle(
    ipcCommands.saveFile,
    (_event, filepath: string, data: string | Buffer) => {
        fs.writeFile(filepath, data, (err) => {
            if (err) {
                return Promise.reject(new Error(`Unable to save file: ${err}`));
            }
            return Promise.resolve(true);
        });
    }
);

// Provides access to save file dialog from renderer processes.
ipcMain.handle(ipcCommands.saveFileDialog, async (_event, opts) => {
    return dialog.showSaveDialog(opts);
});

// Updates the location of the grpc endpoint.
ipcMain.handle(
    ipcCommands.grpcSetLocation,
    async (_event, address: string, port: string) => {
        return setClientLocation(address, port);
    }
);

// Performs the given grpc command, with the given input;
ipcMain.handle(
    ipcCommands.grpcCall,
    async (_event, command: string, input: Record<string, string>) => {
        try {
            const response = await grpcCall(command, input);
            return { successful: true, response };
        } catch (error) {
            return { successful: false, error };
        }
    }
);

// Creates a standalone GRPC client for testing the connection
// to a node. This is used to verify that when changing connection
// that the new node is on the same blockchain as the wallet was previously connected to.
ipcMain.handle(
    ipcCommands.grpcNodeConsensusAndGlobal,
    async (_event, address: string, port: string) => {
        try {
            const nodeClient = new ConcordiumNodeClient(
                address,
                Number.parseInt(port, 10)
            );
            const consensusStatusSerialized = await nodeClient.getConsensusStatus();
            const consensusStatus: ConsensusStatus = JSON.parse(
                JsonResponse.deserializeBinary(
                    consensusStatusSerialized
                ).getValue()
            );
            const globalSerialized = await nodeClient.getCryptographicParameters(
                consensusStatus.lastFinalizedBlock
            );
            return {
                successful: true,
                response: {
                    consensus: consensusStatusSerialized,
                    global: globalSerialized,
                },
            };
        } catch (error) {
            return { successful: false, error };
        }
    }
);

enum PrintErrorTypes {
    Cancelled = 'cancelled',
    Failed = 'failed',
    NoPrinters = 'no valid printers available',
}

// Prints the given body.
ipcMain.handle(ipcCommands.print, (_event, body) => {
    return new Promise<string | void>((resolve, reject) => {
        if (!printWindow) {
            reject(new Error('Internal error: Unable to print'));
        } else {
            printWindow.loadURL(`data:text/html;charset=utf-8,${body}`);
            const content = printWindow.webContents;
            content.on('did-finish-load', () => {
                content.print({}, (success, errorType) => {
                    if (!success) {
                        if (errorType === PrintErrorTypes.Cancelled) {
                            resolve();
                        }
                        resolve(errorType);
                    } else {
                        resolve();
                    }
                });
            });
        }
    });
});

ipcMain.handle(ipcCommands.openUrl, (_event, url: string) => {
    if (!mainWindow) {
        return;
    }
    shell.openExternal(url);
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

if (process.env.E2E_BUILD === 'true') {
    // eslint-disable-next-line promise/catch-or-return
    app.whenReady().then(createWindow);
} else {
    app.on('ready', createWindow);
}

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
});

// The default changed after Electron 8, this sets the value
// equal to the Electron 8 value to avoid having to rework what
// is broken by the change in value.
// Note that in future Electron releases we will not have the option
// to set this to false.
app.allowRendererProcessReuse = false;
