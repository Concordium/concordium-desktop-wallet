// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import EventEmitter from 'events';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp, isOutdated } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { LedgerObserver } from './ledgerObserver';
import loggingMethods from '../logging';

export default class LedgerObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClientMain | undefined;

    ledgerSubscription: Subscription | undefined;

    getLedgerClient(): ConcordiumLedgerClientMain {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    async subscribeLedger(mainWindow: EventEmitter): Promise<void> {
        if (!this.ledgerSubscription) {
            this.ledgerSubscription = TransportNodeHid.listen(
                this.createLedgerObserver(mainWindow)
            );
        }
    }

    async resetTransport(mainWindow: EventEmitter) {
        await TransportNodeHid.disconnect();
        const transport = await TransportNodeHid.open(
            'descriptior is not used'
        );
        // transport.setAllowAutoDisconnect(false);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: async (event: any) => {
                loggingMethods.info(JSON.stringify(event));
                if (event.type === 'add') {
                    const deviceName = event.deviceModel.productName;
                    const transport = await TransportNodeHid.open(
                        'descriptor is not used'
                    );
                    // transport.setAllowAutoDisconnect(false);
                    this.concordiumClient = new ConcordiumLedgerClientMain(
                        mainWindow,
                        transport
                    );
                    let appAndVersion;
                    try {
                        appAndVersion = await this.concordiumClient.getAppAndVersion();
                    } catch (e) {
                        throw new Error(`Unable to get current app: ${e}`);
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
                        action =
                            LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION;
                    }
                    mainWindow.emit(
                        ledgerIpcCommands.listenChannel,
                        action,
                        deviceName
                    );
                } else if (event.type === 'remove') {
                    if (this.concordiumClient) {
                        this.concordiumClient.closeTransport();
                    }
                    mainWindow.emit(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.RESET
                    );
                }
            },
        };
        return ledgerObserver;
    }
}
