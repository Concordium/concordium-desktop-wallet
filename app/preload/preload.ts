import { ipcRenderer, contextBridge, Rectangle } from 'electron';
import EventEmitter from 'events';
import {
    openRoute,
    readyToShow,
    didFinishLoad,
    logFromMain,
} from '~/constants/ipcRendererCommands.json';
import {
    onAwaitVerificationKey,
    onVerificationKeysConfirmed,
    listenChannel,
} from '~/constants/ledgerIpcCommands.json';
import initializeGrpcMethods from './grpc';
import initializeClipboardMethods from './clipboard';
import initializeFilesMethods from './files';
import initializeCryptoMethods from './crypto';
import initializeLedgerMethods from './ledger/ledger';
import initializeHttpMethods from './http';
import initializeDatabaseGeneralMethods from './database/general';
import initializeDatabaseAccountMethods from './database/accountDao';
import initializeDatabaseAddressBookMethods from './database/addressBookDao';
import initializeDatabaseCredentialMethods from './database/credentialDao';
import initializeDatabaseExternalCredentialMethods from './database/externalCredentialDao';
import initializeDatabaseIdentityMethods from './database/identityDao';
import initializeDatabaseGenesisAndGlobalMethods from './database/genesisAndGlobalDao';
import initializeDatabaseMultiSignatureTransactionMethods from './database/multiSignatureProposalDao';
import initializeDatabaseSettingsMethods from './database/settingsDao';
import initializeDatabaseTransactionsMethods from './database/transactionsDao';
import initializeDatabaseWalletMethods from './database/walletDao';
import autoUpdateMethods from './autoUpdate';

import ipcCommands from '~/constants/ipcCommands.json';

import {
    Listen,
    Database,
    Once,
    WindowFunctions,
    BrowserViewMethods,
} from './preloadTypes';

import type { EqualRecord } from '~/utils/types';

const Exposed: EqualRecord<WindowFunctions> = {
    addListener: 'addListener',
    removeListener: 'removeListener',
    once: 'once',
    grpc: 'grpc',
    cryptoMethods: 'cryptoMethods',
    database: 'database',
    ledger: 'ledger',
    files: 'files',
    http: 'http',
    printElement: 'printElement',
    writeImageToClipboard: 'writeImageToClipboard',
    openUrl: 'openUrl',
    removeAllListeners: 'removeAllListeners',
    view: 'view',
    autoUpdate: 'autoUpdate',
};

const eventEmitter = new EventEmitter();

const listenImpl: Listen = {
    openRoute: (func) => ipcRenderer.on(openRoute, func),
    readyToShow: (func) => ipcRenderer.on(readyToShow, func),
    didFinishLoad: (func) => ipcRenderer.on(didFinishLoad, func),
    ledgerChannel: (func) => eventEmitter.on(listenChannel, func),
    logFromMain: (func) => ipcRenderer.on(logFromMain, func),
};

const removeListener: Listen = {
    openRoute: (func) => ipcRenderer.off(openRoute, func),
    readyToShow: (func) => ipcRenderer.off(readyToShow, func),
    didFinishLoad: (func) => ipcRenderer.off(didFinishLoad, func),
    ledgerChannel: (func) => eventEmitter.off(listenChannel, func),
    logFromMain: (func) => ipcRenderer.off(logFromMain, func),
};

const onceImpl: Once = {
    onAwaitVerificationKey: (func) =>
        eventEmitter.once(onAwaitVerificationKey, func),
    onVerificationKeysConfirmed: (func) =>
        eventEmitter.once(onVerificationKeysConfirmed, func),
};

const browserViewImpl: BrowserViewMethods = {
    createView: (location: string, rect: Rectangle) =>
        ipcRenderer.invoke(ipcCommands.createView, location, rect),
    removeView: () => ipcRenderer.invoke(ipcCommands.removeView),
    resizeView: (rect: Rectangle) =>
        ipcRenderer.invoke(ipcCommands.resizeView, rect),
};

contextBridge.exposeInMainWorld(Exposed.view, browserViewImpl);

contextBridge.exposeInMainWorld(Exposed.removeAllListeners, (channel: string) =>
    ipcRenderer.removeAllListeners(channel)
);
contextBridge.exposeInMainWorld(Exposed.addListener, listenImpl);
contextBridge.exposeInMainWorld(Exposed.removeListener, removeListener);

contextBridge.exposeInMainWorld(Exposed.once, onceImpl);
contextBridge.exposeInMainWorld(Exposed.printElement, (body: string) =>
    ipcRenderer.invoke(ipcCommands.print, body)
);
contextBridge.exposeInMainWorld(Exposed.openUrl, (href: string) =>
    ipcRenderer.invoke(ipcCommands.openUrl, href)
);

contextBridge.exposeInMainWorld(Exposed.grpc, initializeGrpcMethods);
contextBridge.exposeInMainWorld(
    Exposed.writeImageToClipboard,
    initializeClipboardMethods
);
contextBridge.exposeInMainWorld(Exposed.files, initializeFilesMethods);
contextBridge.exposeInMainWorld(Exposed.cryptoMethods, initializeCryptoMethods);
contextBridge.exposeInMainWorld(
    Exposed.ledger,
    initializeLedgerMethods(eventEmitter)
);
contextBridge.exposeInMainWorld(Exposed.http, initializeHttpMethods);

// Gather all database relevant functions in the same subdomain
const databaseMethods: Database = {
    general: initializeDatabaseGeneralMethods,
    account: initializeDatabaseAccountMethods,
    addressBook: initializeDatabaseAddressBookMethods,
    credentials: initializeDatabaseCredentialMethods,
    externalCredential: initializeDatabaseExternalCredentialMethods,
    identity: initializeDatabaseIdentityMethods,
    genesisAndGlobal: initializeDatabaseGenesisAndGlobalMethods,
    multiSignatureTransaction: initializeDatabaseMultiSignatureTransactionMethods,
    settings: initializeDatabaseSettingsMethods,
    transaction: initializeDatabaseTransactionsMethods,
    wallet: initializeDatabaseWalletMethods,
};

contextBridge.exposeInMainWorld(Exposed.database, databaseMethods);
contextBridge.exposeInMainWorld(Exposed.autoUpdate, autoUpdateMethods);
