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
import ipcCommands from './constants/ipcCommands.json';
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
    EncryptedData,
    Hex,
    MultiSignatureTransaction,
    Setting,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
    WalletEntry,
    WalletType,
} from './utils/types';
import { knex, setPassword } from './database/knex';
import {
    walletTable,
    transactionTable,
    settingsTable,
    multiSignatureProposalTable,
} from './constants/databaseNames.json';
import migrate from './database/migration';
import { convertBooleans } from './database/TransactionDao';
import { chunkArray, partition } from './utils/basicHelpers';

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

// TODO Refactor.
ipcMain.handle('setPassword', (_event, password: string) => {
    setPassword(password);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('dbMigrate', (_event) => {
    migrate();
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
