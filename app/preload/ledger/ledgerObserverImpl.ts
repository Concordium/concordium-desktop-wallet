/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import EventEmitter from 'events';
import { usb } from 'usb';
import { identifyUSBProductId, ledgerUSBVendorId } from '@ledgerhq/devices';
import { Mutex } from 'async-mutex';
import fs from 'fs';
import path from 'path';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp, isOutdated } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { LedgerObserver } from './ledgerObserver';

function logError(message: string, ...args: unknown[]) {
    const logPath = path.join(__dirname, 'crash.log');
    const timestamp = new Date().toISOString();
    const details = args.map(a => {
        if (a instanceof Error) {
            return `${a.name}: ${a.message}\n${a.stack}`;
        }
        try {
            return JSON.stringify(a);
        } catch {
            return String(a);
        }
    }).join(' ');
    const fullMsg = `[${timestamp}] ERROR: ${message} ${details}\n`;
    try {
        fs.appendFileSync(logPath, fullMsg);
    // eslint-disable-next-line no-empty
    } catch (e) {}

}

function isDeviceLockedError(err: unknown): boolean {
    if (!err) return false;
    if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        return msg.includes('locked') || msg.includes('unlock') || msg.includes('device is locked') || msg.includes('no device selected') || msg.includes('app not open');
    }
    if (typeof err === 'string') {
        const msg = err.toLowerCase();
        return msg.includes('locked') || msg.includes('unlock') || msg.includes('device is locked') || msg.includes('no device selected') || msg.includes('app not open');
    }
    return false;
}
/**
 * A convenience method for opening a transport by providing
 * an empty descriptor (as the descriptor is unused downstream).
 * @returns a promise with a {@link TransportNodeHid}
 */
let currentTransport: TransportNodeHid | null = null;
async function openTransport(): Promise<TransportNodeHid> {
    if (currentTransport) {
        try {
            await currentTransport.close();
        } catch (err) {
            logError('openTransport: Error closing previous transport', err);
        }
        currentTransport = null;
    }
    try {
        currentTransport = await TransportNodeHid.open('');
        return currentTransport;
    } catch (err) {
        logError('openTransport: Error opening transport', err);
        throw err;
    }
}

export default class LedgerObserverImpl implements LedgerObserver {
    private static transportMutex = new Mutex();

    concordiumClient: ConcordiumLedgerClientMain | undefined;

    ledgerSubscription: Subscription | undefined;

    getLedgerClient(): ConcordiumLedgerClientMain {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    private pollingInterval: ReturnType<typeof setInterval> | null = null;

    private async ensureClient(mainWindow: EventEmitter): Promise<ConcordiumLedgerClientMain> {
        if (!this.concordiumClient) {
            const transport = await openTransport();
            this.concordiumClient = new ConcordiumLedgerClientMain(mainWindow, transport);
        }
        return this.concordiumClient;
    }

    private pollForConcordiumApp(mainWindow: EventEmitter, deviceName?: string) {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.pollingInterval = setInterval(async () => {
            await LedgerObserverImpl.transportMutex.runExclusive(async () => {
                try {
                    const client = await this.ensureClient(mainWindow);
                    let appAndVersion;
                    try {
                        appAndVersion = await client.getAppAndVersion();
                    } catch (err) {
                        if (isDeviceLockedError(err)) {
                            logError('pollForConcordiumApp: Device is locked or app not open.', err);
                            return;
                        }
                        throw err;
                    }
                    if (!isConcordiumApp(appAndVersion)) {
                        return;
                    }
                    if (this.pollingInterval !== null) {
                        clearInterval(this.pollingInterval);
                        this.pollingInterval = null;
                    }
                    let action;
                    if (isOutdated(appAndVersion)) {
                        action = LedgerSubscriptionAction.OUTDATED;
                    } else {
                        action = LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION;
                    }
                    mainWindow.emit(ledgerIpcCommands.listenChannel, action, deviceName);
                } catch (err) {
                    logError('pollForConcordiumApp: Error during polling for Concordium app on Ledger.', err);
                }
            });
        }, 5000);
    }

    private handleIfLedgerIsStillConnected(device: usb.Device, mainWindow: EventEmitter) {
        if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) {
            return;
        }
        LedgerObserverImpl.transportMutex.runExclusive(async () => {
            try {
                await openTransport();
                await this.concordiumClient?.getAppAndVersion().catch((err) => {
                    if (isDeviceLockedError(err)) {
                        logError('handleIfLedgerIsStillConnected: Device is locked or app not open.', err);
                        return;
                    }
                    logError('handleIfLedgerIsStillConnected: getAppAndVersion failed', err);
                });
                const deviceModel = identifyUSBProductId(device.deviceDescriptor.idProduct);
                this.updateLedgerState(mainWindow, deviceModel?.productName);
            } catch (err) {
                if (isDeviceLockedError(err)) {
                    logError('handleIfLedgerIsStillConnected: Device is locked or app not open.', err);
                    return;
                }
                logError('handleIfLedgerIsStillConnected: Error while checking if Ledger is still connected.', err);
            }
        });
    }

    async subscribeLedger(mainWindow: EventEmitter): Promise<void> {
        if (!this.ledgerSubscription) {
            this.ledgerSubscription = TransportNodeHid.listen(this.createLedgerObserver(mainWindow));

            usb.on('detach', (event) => this.handleIfLedgerIsStillConnected(event, mainWindow));
        }
    }

    async resetTransport(mainWindow: EventEmitter) {
        await LedgerObserverImpl.transportMutex.runExclusive(async () => {
            try {
                TransportNodeHid.disconnect();
                const transport = await openTransport();
                this.concordiumClient = new ConcordiumLedgerClientMain(mainWindow, transport);
                try {
                    await this.concordiumClient.getAppAndVersion();
                } catch (err) {
                    if (isDeviceLockedError(err)) {
                        logError('resetTransport: Device is locked or app not open.', err);
                        return;
                    }
                    logError('resetTransport: Error while getting app and version.', err);
                }
            } catch (err) {
                logError('resetTransport: Error while resetting transport.', err);
            }
        });
    }

    async closeTransport(): Promise<void> {
        await LedgerObserverImpl.transportMutex.runExclusive(async () => {
            try {
                if (this.concordiumClient) {
                    this.concordiumClient.closeTransport();
                    this.concordiumClient = undefined;
                }
            } catch (err) {
                logError('closeTransport: Error closing concordiumClient transport', err);
            }
        });
    }

    private async updateLedgerState(mainWindow: EventEmitter, deviceName?: string) {
        await LedgerObserverImpl.transportMutex.runExclusive(async () => {
            let appAndVersion;
            try {
                const transport = await openTransport();
                this.concordiumClient = new ConcordiumLedgerClientMain(mainWindow, transport);
                try {
                    appAndVersion = await this.concordiumClient.getAppAndVersion();
                } catch (err) {
                    if (isDeviceLockedError(err)) {
                        logError('updateLedgerState: Device is locked or app not open.', err);
                        return;
                    }
                    logError('updateLedgerState: Error while getting app and version.', err);
                    mainWindow.emit(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.RESET,
                        deviceName
                    );
                    return;
                }
            } catch (err) {
                logError('updateLedgerState: Error while opening transport.', err);
                mainWindow.emit(
                    ledgerIpcCommands.listenChannel,
                    LedgerSubscriptionAction.RESET,
                    deviceName
                );
                return;
            }
            if (appAndVersion && !isConcordiumApp(appAndVersion)) {
                this.pollForConcordiumApp(mainWindow, deviceName);
                return;
            }
            let action;
            if (!appAndVersion) {
                action = LedgerSubscriptionAction.RESET;
            } else if (!isConcordiumApp(appAndVersion)) {
                action = LedgerSubscriptionAction.PENDING;
            } else if (isOutdated(appAndVersion)) {
                action = LedgerSubscriptionAction.OUTDATED;
            } else {
                action = LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION;
            }
            mainWindow.emit(ledgerIpcCommands.listenChannel, action, deviceName);
        });
    }

    private async onAdd(event: DescriptorEvent<string>, mainWindow: EventEmitter) {
        const deviceName = event.deviceModel?.productName;
        await this.updateLedgerState(mainWindow, deviceName);
    }

    private async onRemove(mainWindow: EventEmitter) {
        await this.closeTransport();
        mainWindow.emit(ledgerIpcCommands.listenChannel, LedgerSubscriptionAction.RESET);
    }

    createLedgerObserver(mainWindow: EventEmitter): Observer<DescriptorEvent<string>> {
        const ledgerObserver: Observer<DescriptorEvent<string>> = {
            complete: () => {},
            error: (err?: unknown) => {
                logError('createLedgerObserver: error called', err);
                mainWindow.emit(
                    ledgerIpcCommands.listenChannel,
                    LedgerSubscriptionAction.ERROR_SUBSCRIPTION
                );
            },
            next: async (event: DescriptorEvent<string>) => {
                try {
                    if (event.type === 'add') {
                        await this.onAdd(event, mainWindow);
                    } else if (event.type === 'remove') {
                        await this.onRemove(mainWindow);
                    }
                } catch (err) {
                    logError('createLedgerObserver: Error in next handler', err);
                }
            },
        };
        return ledgerObserver;
    }
}
