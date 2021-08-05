import { ipcRenderer, contextBridge } from 'electron';
import EventEmitter from 'events';
import {
    openRoute,
    readyToShow,
    didFinishLoad,
} from '~/constants/ipcRendererCommands.json';
import {
    onAwaitVerificationKey,
    onVerificationKeysConfirmed,
    listenChannel,
} from '~/constants/ledgerIpcCommands.json';
import initializeGrpcIpcHandlers from './ipc/grpc';
import initializeClipboardIpcHandlers from './ipc/clipboard';
import initializeFilesIpcHandlers from './ipc/files';
import initializeCryptoIpcHandlers from './ipc/crypto';
import initializeLedgerIpcHandlers from './ipc/ledger/ledger';
import initializeHttpIpcHandlers from './ipc/http';
import initializeDatabaseGeneralIpcHandlers from './ipc/database/general';
import initializeDatabaseAccountIpcHandlers from './ipc/database/accountDao';
import initializeDatabaseAddressBookIpcHandlers from './ipc/database/addressBookDao';
import initializeDatabaseCredentialIpcHandlers from './ipc/database/credentialDao';
import initializeDatabaseExternalCredentialIpcHandlers from './ipc/database/externalCredentialDao';
import initializeDatabaseIdentityIpcHandlers from './ipc/database/identityDao';
import initializeDatabaseGenesisAndGlobalIpcHandlers from './ipc/database/genesisAndGlobalDao';
import initializeDatabaseMultiSignatureTransactionIpcHandlers from './ipc/database/multiSignatureProposalDao';
import initializeDatabaseSettingsIpcHandlers from './ipc/database/settingsDao';
import initializeDatabaseTransactionsIpcHandlers from './ipc/database/transactionsDao';
import initializeDatabaseWalletIpcHandlers from './ipc/database/walletDao';

import ipcCommands from '~/constants/ipcCommands.json';

import { Listen, Database, Once } from './preloadTypes';

const eventEmitter = new EventEmitter();

const listenImpl: Listen = {
    openRoute: (func) => ipcRenderer.on(openRoute, func),
    readyToShow: (func) => ipcRenderer.on(readyToShow, func),
    didFinishLoad: (func) => ipcRenderer.on(didFinishLoad, func),
    ledgerChannel: (func) => eventEmitter.on(listenChannel, func),
};

const onceImpl: Once = {
    onAwaitVerificationKey: (func) =>
        eventEmitter.once(onAwaitVerificationKey, func),
    onVerificationKeysConfirmed: (func) =>
        eventEmitter.once(onVerificationKeysConfirmed, func),
};

contextBridge.exposeInMainWorld('removeAllListeners', (channel: string) =>
    ipcRenderer.removeAllListeners(channel)
);
contextBridge.exposeInMainWorld('listen', listenImpl);
contextBridge.exposeInMainWorld('once', onceImpl);
contextBridge.exposeInMainWorld('printElement', (body: string) =>
    ipcRenderer.invoke(ipcCommands.print, body)
);
contextBridge.exposeInMainWorld('openUrl', (href: string) =>
    ipcRenderer.invoke(ipcCommands.openUrl, href)
);

const databaseIpcHandlers: Database = {
    general: initializeDatabaseGeneralIpcHandlers,
    account: initializeDatabaseAccountIpcHandlers,
    addressBook: initializeDatabaseAddressBookIpcHandlers,
    credentials: initializeDatabaseCredentialIpcHandlers,
    externalCredential: initializeDatabaseExternalCredentialIpcHandlers,
    identity: initializeDatabaseIdentityIpcHandlers,
    genesisAndGlobal: initializeDatabaseGenesisAndGlobalIpcHandlers,
    multiSignatureTransaction: initializeDatabaseMultiSignatureTransactionIpcHandlers,
    settings: initializeDatabaseSettingsIpcHandlers,
    transaction: initializeDatabaseTransactionsIpcHandlers,
    wallet: initializeDatabaseWalletIpcHandlers,
};

contextBridge.exposeInMainWorld('grpc', initializeGrpcIpcHandlers);
contextBridge.exposeInMainWorld(
    'writeImageToClipboard',
    initializeClipboardIpcHandlers
);
contextBridge.exposeInMainWorld('files', initializeFilesIpcHandlers);
contextBridge.exposeInMainWorld('cryptoMethods', initializeCryptoIpcHandlers);
contextBridge.exposeInMainWorld(
    'ledger',
    initializeLedgerIpcHandlers(eventEmitter)
);
contextBridge.exposeInMainWorld('http', initializeHttpIpcHandlers);
contextBridge.exposeInMainWorld('database', databaseIpcHandlers);
