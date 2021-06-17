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
import * as crypto from 'crypto';
import { Knex, knex as externalKnex } from 'knex';
import ipcCommands from './constants/ipcCommands.json';
import ipcRendererCommands from './constants/ipcRendererCommands.json';
import { setClientLocation, grpcCall } from './node/GRPCClient';
import ConcordiumNodeClient from './node/ConcordiumNodeClient';
import { ConsensusStatus } from './node/NodeApiTypes';
import { JsonResponse } from './proto/concordium_p2p_rpc_pb';
import config, { getDatabaseFilename } from './database/knexfile';
import {
    Account,
    AddressBookEntry,
    Global,
    Hex,
    Identity,
    MultiSignatureTransaction,
    Setting,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
    WalletEntry,
    WalletType,
} from './utils/types';
import { invalidateKnexSingleton, knex, setPassword } from './database/knex';
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
import { subscribeLedger } from './ledgerObserver';
import initializeIpcHandlers from './ipc/http';
import initializeLedgerIpcHandlers from './ipc/ledger';
import initializeEncryptionIpcHandlers from './ipc/encryption';

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

    /**
     * Do not change any of the webpreference settings without consulting the
     * security documentation provided
     */
    mainWindow = new BrowserWindow({
        title: `Concordium Wallet ${titleSuffix}`,
        show: false,
        width: 4096,
        height: 2912,
        webPreferences:
            process.env.NODE_ENV === 'development'
                ? {
                      preload: path.join(__dirname, 'dist/preload.prod.js'),
                      nodeIntegration: false,
                      webviewTag: true,
                      devTools: true,
                  }
                : {
                      preload: path.join(__dirname, 'dist/preload.prod.js'),
                      webviewTag: true,
                      nodeIntegration: false,
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

    if (process.env.NODE_ENV === 'production') {
        mainWindow.loadURL(`file://${__dirname}/app.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/app-dev.html`);
    }

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

initializeIpcHandlers(ipcMain);
initializeLedgerIpcHandlers(ipcMain);
initializeEncryptionIpcHandlers(ipcMain);

ipcMain.handle(
    ipcCommands.database.rekeyDatabase,
    async (_event, oldPassword: string, newPassword: string) => {
        const environment = process.env.NODE_ENV;
        if (!environment) {
            throw new Error(
                'The environment variable was not available as expected.'
            );
        }

        const configuration = await config(environment, oldPassword);

        try {
            const db = externalKnex(configuration);
            await db.select().table('setting');
        } catch (e) {
            return false;
        }
        await (await knex()).raw('PRAGMA rekey = ??', newPassword);
        return true;
    }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.database.checkAccess, async (_event) => {
    try {
        const table = (await knex())(settingsTable);
        await table.select();
        return true;
    } catch {
        return false;
    }
});

ipcMain.handle(ipcCommands.database.setPassword, (_event, password: string) => {
    setPassword(password);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.database.invalidateKnexSingleton, (_event) => {
    invalidateKnexSingleton();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.database.migrate, async (_event) => {
    return migrate();
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
        .then((e) => e.map(sanitizeAddressBookEntry))
        .catch(() => {});
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
            .then((e) => e.map(sanitizeAddressBookEntry))
            .catch(() => {});
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
