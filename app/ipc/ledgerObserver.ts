// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import { BrowserWindow } from 'electron';
import ConcordiumLedgerClientMain from '../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp } from '../components/ledger/util';
import { LedgerSubscriptionAction } from '../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';

let ledgerSubscription: Subscription | undefined;
let concordiumClient: ConcordiumLedgerClientMain;

/**
 * Creates an observer for events happening on the Ledger. The events will be sent using
 * IPC to the window provided.
 * @param mainWindow the window that should receive events from the observer
 */
function createLedgerObserver(
    mainWindow: BrowserWindow
): Observer<DescriptorEvent<string>> {
    const ledgerObserver: Observer<DescriptorEvent<string>> = {
        complete: () => {
            // This is expected to never trigger.
        },
        error: () => {
            mainWindow.webContents.send(
                ledgerIpcCommands.listenChannel,
                LedgerSubscriptionAction.ERROR_SUBSCRIPTION
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: async (event: any) => {
            if (event.type === 'add') {
                const deviceName = event.deviceModel.productName;
                const transport = await TransportNodeHid.open();
                concordiumClient = new ConcordiumLedgerClientMain(
                    transport,
                    mainWindow
                );
                const appAndVersionResult = await concordiumClient.getAppAndVersion();
                const appAndVersion = appAndVersionResult.result;
                if (!appAndVersion) {
                    // We could not extract the version information.
                    mainWindow.webContents.send(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.RESET
                    );
                    return;
                }

                if (isConcordiumApp(appAndVersion)) {
                    mainWindow.webContents.send(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION,
                        deviceName
                    );
                } else {
                    // The device has been connected, but the Concordium application has not
                    // been opened yet.
                    mainWindow.webContents.send(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.PENDING,
                        deviceName
                    );
                }
            } else if (event.type === 'remove') {
                if (concordiumClient) {
                    concordiumClient.closeTransport();
                }
                mainWindow.webContents.send(
                    ledgerIpcCommands.listenChannel,
                    LedgerSubscriptionAction.RESET
                );
            }
        },
    };
    return ledgerObserver;
}

export function getLedgerClient(): ConcordiumLedgerClientMain {
    return concordiumClient;
}

/**
 * Subscribes to events from the Ledger.
 * @param win the renderer to send events from the Ledger to
 */
export function subscribeLedger(win: BrowserWindow) {
    if (!ledgerSubscription) {
        ledgerSubscription = TransportNodeHid.listen(createLedgerObserver(win));
    }
}

export function closeTransport() {
    if (concordiumClient) {
        concordiumClient.closeTransport();
    }
}
