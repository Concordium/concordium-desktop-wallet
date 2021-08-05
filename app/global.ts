/* eslint-disable */
import {
    Listen,
    GRPC,
    Database,
    CryptoMethods,
    LedgerCommands,
    Once,
    HttpMethods,
    FileMethods,
} from './preloadTypes';

declare global {
    interface Window {
        listen: Listen;
        once: Once;
        grpc: GRPC;
        cryptoMethods: CryptoMethods;
        database: Database;
        ledger: LedgerCommands;
        files: FileMethods;
        http: HttpMethods;
        printElement: (body: string) => any;
        writeImageToClipboard: (dataUrl: string) => void;
        openUrl: (href: string) => any;
        removeAllListeners: (channel: string) => void;
    }
}
