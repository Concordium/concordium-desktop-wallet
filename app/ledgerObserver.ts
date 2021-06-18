// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid-singleton';
import type {
    Observer,
    DescriptorEvent,
    Subscription,
} from '@ledgerhq/hw-transport';
import { BrowserWindow } from 'electron';
import ConcordiumLedgerClientMain from './features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp } from './components/ledger/util';
import { LedgerSubscriptionAction } from './components/ledger/useLedger';

let ledgerSubscription: Subscription;
let concordiumClient: ConcordiumLedgerClientMain;
let window: BrowserWindow;

const ledgerObserver: Observer<DescriptorEvent<string>> = {
    complete: () => {
        // This is expected to never trigger.
    },
    error: () => {
        window.webContents.send(
            'ledger',
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
                window
            );
            const appAndVersion = await concordiumClient.getAppAndVersion();

            if (isConcordiumApp(appAndVersion)) {
                window.webContents.send(
                    'ledger',
                    LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION,
                    deviceName
                );
            } else {
                // The device has been connected, but the Concordium application has not
                // been opened yet.
                window.webContents.send(
                    'ledger',
                    LedgerSubscriptionAction.PENDING,
                    deviceName
                );
            }
        } else if (event.type === 'remove') {
            if (concordiumClient) {
                concordiumClient.closeTransport();
            }
            window.webContents.send('ledger', LedgerSubscriptionAction.RESET);
        }
    },
};

export function getLedgerClient(): ConcordiumLedgerClientMain {
    return concordiumClient;
}

export function subscribeLedger(win: BrowserWindow) {
    window = win;
    ledgerSubscription = TransportNodeHid.listen(ledgerObserver);
}

export function unsubscribe() {
    if (ledgerSubscription) {
        ledgerSubscription.unsubscribe();
    }
}
