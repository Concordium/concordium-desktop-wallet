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
import logger from '../logging';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp, isOutdated } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { LedgerObserver } from './ledgerObserver';

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

let currentTransport: TransportNodeHid | null = null;

/**
 * A convenience method for opening a transport by providing
 * an empty descriptor (as the descriptor is unused downstream).
 * @returns a promise with a {@link TransportNodeHid}
 */
async function openTransport(): Promise<TransportNodeHid> {
    if (currentTransport) {
        try {
            await currentTransport.close();
        } catch (err) {
            logger.error(err, 'openTransport: Error closing previous transport');
        }
        currentTransport = null;
    }
    try {
        currentTransport = await TransportNodeHid.open('');
        return currentTransport;
    } catch (err) {
    logger.error(err, 'openTransport: Error opening transport');
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

     /**
     * Polls the Ledger device every 5 seconds to check if the Concordium app is open.
     * If the app is found, it emits an action to the main window indicating whether
     * the app is outdated or connected. It stops polling once the app is detected.
     *
     * @param mainWindow - The main window's EventEmitter to emit actions to the window.
     * @param deviceName - An optional name of the device to include in the emitted action.
     *
     * The polling interval is cleared when the Concordium app is detected or if any transient errors occur.
     */

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
                            logger.error(err, 'pollForConcordiumApp: Device is locked or app not open.');
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
                        logger.error(err, 'pollForConcordiumApp: Error during polling for Concordium app on Ledger.');
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
                        logger.error(err, 'handleIfLedgerIsStillConnected: Device is locked or app not open.');
                        return;
                    }
                    logger.error(err, 'handleIfLedgerIsStillConnected: getAppAndVersion failed');
                });
                const deviceModel = identifyUSBProductId(device.deviceDescriptor.idProduct);
                this.updateLedgerState(mainWindow, deviceModel?.productName);
            } catch (err) {
                if (isDeviceLockedError(err)) {
                    logger.error(err, 'handleIfLedgerIsStillConnected: Device is locked or app not open.');
                    return;
                }
                logger.error(err, 'handleIfLedgerIsStillConnected: Error while checking if Ledger is still connected.');
            }
        });
    }

    async subscribeLedger(mainWindow: EventEmitter): Promise<void> {
        if (!this.ledgerSubscription) {
            this.ledgerSubscription = TransportNodeHid.listen(this.createLedgerObserver(mainWindow));
            
            // The TransportNodeHid.listen() does not always catch all the relevant
            // USB events on Windows. This is specifically a problem when opening or
            // closing the Concordium app on the Ledger as it fires an attach and a
            // detach event at the same time. Therefore we add a raw USB listener as a backup
            // that will ensure that we maintain an intact connection state.
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
                        logger.error(err, 'resetTransport: Device is locked or app not open.');
                        return;
                    }
                    logger.error(err, 'resetTransport: Error while getting app and version.');
                }
            } catch (err) {
                logger.error(err, 'resetTransport: Error while resetting transport.');
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
                logger.error(err, 'closeTransport: Error closing concordiumClient transport');
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
                        logger.error(err, 'updateLedgerState: Device is locked or app not open.');
                        return;
                    }
                    logger.error(err, 'updateLedgerState: Error while getting app and version.');
                    mainWindow.emit(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.RESET,
                        deviceName
                    );
                    return;
                }
            } catch (err) {
                logger.error(err, 'updateLedgerState: Error while opening transport.');
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
                logger.error(err instanceof Error ? err : new Error(String(err)), 'createLedgerObserver: error called');
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
                    logger.error(err instanceof Error ? err : new Error(String(err)), 'createLedgerObserver: Error in next handler');
                }
            },
        };
        return ledgerObserver;
    }
}
