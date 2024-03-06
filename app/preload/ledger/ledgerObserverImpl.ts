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
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp, isOutdated } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { LedgerObserver } from './ledgerObserver';

/**
 * A convenience method for opening a transport by providing
 * an empty descriptor (as the descriptor is unused downstream).
 * @returns a promise with a {@link TransportNodeHid}
 */
async function openTransport(): Promise<TransportNodeHid> {
    return TransportNodeHid.open('');
}

export default class LedgerObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClientMain | undefined;

    ledgerSubscription: Subscription | undefined;

    getLedgerClient(): ConcordiumLedgerClientMain {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    private handleIfLedgerIsStillConnected(
        device: usb.Device,
        mainWindow: EventEmitter
    ) {
        // Ignore events for non-Ledger USB devices.
        if (device.deviceDescriptor.idVendor !== ledgerUSBVendorId) {
            return;
        }

        openTransport()
            .then(() => {
                // First attempt to get the app and version from the device. This is necessary
                // to flush any previous messages on the channel, and that can lead to us
                // receiving a message stating that the Concordium app is still running.
                this.concordiumClient
                    ?.getAppAndVersion()
                    .catch(() => {})
                    .finally(() => {
                        const deviceModel = identifyUSBProductId(
                            device.deviceDescriptor.idProduct
                        );
                        this.updateLedgerState(
                            mainWindow,
                            deviceModel?.productName
                        );
                        return true;
                    });
                return true;
            })
            .catch(() => null);
    }

    async subscribeLedger(mainWindow: EventEmitter): Promise<void> {
        if (!this.ledgerSubscription) {
            this.ledgerSubscription = TransportNodeHid.listen(
                this.createLedgerObserver(mainWindow)
            );

            // The TransportNodeHid.listen() does not always catch all the relevant
            // USB events on Windows. This is specifically a problem when opening or
            // closing the Concordium app on the Ledger as it fires an attach and a
            // detach event at the same time. Therefore we add a raw USB listener as a backup
            // that will ensure that we maintain an intact connection state.
            usb.on('detach', (event) =>
                this.handleIfLedgerIsStillConnected(event, mainWindow)
            );
        }
    }

    async resetTransport(mainWindow: EventEmitter) {
        TransportNodeHid.disconnect();
        const transport = await openTransport();
        this.concordiumClient = new ConcordiumLedgerClientMain(
            mainWindow,
            transport
        );

        // There may be a previous message from the previous channel on the transport
        // (even though we just opened a new one!). Therefore we do this call to get rid
        // of any such old message that would otherwise fail elsewhere.
        try {
            await this.concordiumClient.getAppAndVersion();
        } catch (_e) {
            // Expected to happen. Do nothing with the error.
        }
    }

    closeTransport(): void {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
    }

    private async updateLedgerState(
        mainWindow: EventEmitter,
        deviceName?: string
    ) {
        let appAndVersion;
        try {
            const transport = await openTransport();
            this.concordiumClient = new ConcordiumLedgerClientMain(
                mainWindow,
                transport
            );
            appAndVersion = await this.concordiumClient.getAppAndVersion();
        } catch {
            mainWindow.emit(
                ledgerIpcCommands.listenChannel,
                LedgerSubscriptionAction.RESET,
                deviceName
            );
            return;
        }

        let action;
        if (!appAndVersion) {
            // We could not extract the version information.
            action = LedgerSubscriptionAction.RESET;
        } else if (!isConcordiumApp(appAndVersion)) {
            // The device has been connected, but the Concordium application has not
            // been opened yet.
            action = LedgerSubscriptionAction.PENDING;
        } else if (isOutdated(appAndVersion)) {
            // The device has been connected, but the Concordium application is outdated
            action = LedgerSubscriptionAction.OUTDATED;
        } else {
            action = LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION;
        }
        mainWindow.emit(ledgerIpcCommands.listenChannel, action, deviceName);
    }

    private async onAdd(
        event: DescriptorEvent<string>,
        mainWindow: EventEmitter
    ) {
        const deviceName = event.deviceModel?.productName;
        this.updateLedgerState(mainWindow, deviceName);
    }

    private onRemove(mainWindow: EventEmitter) {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
        mainWindow.emit(
            ledgerIpcCommands.listenChannel,
            LedgerSubscriptionAction.RESET
        );
    }

    /**
     * Creates an observer for events happening on the Ledger. The events will be sent using
     * IPC to the window provided.
     * @param mainWindow the window that should receive events from the observer
     */
    createLedgerObserver(
        mainWindow: EventEmitter
    ): Observer<DescriptorEvent<string>> {
        const ledgerObserver: Observer<DescriptorEvent<string>> = {
            complete: () => {
                // This is expected to never trigger.
            },
            error: () => {
                mainWindow.emit(
                    ledgerIpcCommands.listenChannel,
                    LedgerSubscriptionAction.ERROR_SUBSCRIPTION
                );
            },
            next: async (event: DescriptorEvent<string>) => {
                if (event.type === 'add') {
                    this.onAdd(event, mainWindow);
                } else if (event.type === 'remove') {
                    this.onRemove(mainWindow);
                }
            },
        };
        return ledgerObserver;
    }
}
