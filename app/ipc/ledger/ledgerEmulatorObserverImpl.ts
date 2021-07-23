import { BrowserWindow } from 'electron';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { sleep } from '~/utils/httpRequests';
import { LedgerObserver } from './ledgerObserver';

export default class LedgerEmulatorObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClientMain | undefined;

    getLedgerClient(): ConcordiumLedgerClientMain {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    async subscribeLedger(mainWindow: BrowserWindow): Promise<void> {
        const listeningClient = new ConcordiumLedgerClientMain(mainWindow);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const result = await listeningClient.getAppAndVersion();
            if (result.error) {
                if (this.concordiumClient) {
                    this.concordiumClient.closeTransport();
                }
                mainWindow.webContents.send(
                    ledgerIpcCommands.listenChannel,
                    LedgerSubscriptionAction.RESET
                );
            } else if (result) {
                this.concordiumClient = new ConcordiumLedgerClientMain(
                    mainWindow
                );

                const appAndVersionResult = await this.concordiumClient.getAppAndVersion();
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
                        'Ledger Emulator'
                    );
                }
            }
            await sleep(10000);
        }
    }

    closeTransport(): void {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
    }
}
