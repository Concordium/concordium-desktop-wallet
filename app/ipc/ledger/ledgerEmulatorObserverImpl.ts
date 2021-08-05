import axios from 'axios';
import EventEmitter from 'events';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';
import { isConcordiumApp } from '../../components/ledger/util';
import { LedgerSubscriptionAction } from '../../components/ledger/useLedger';
import ledgerIpcCommands from '~/constants/ledgerIpcCommands.json';
import { sleep } from '~/utils/httpRequests';
import { LedgerObserver } from './ledgerObserver';

export default class LedgerEmulatorObserverImpl implements LedgerObserver {
    concordiumClient: ConcordiumLedgerClientMain | undefined;

    isConnected: boolean;

    constructor() {
        this.isConnected = false;
    }

    getLedgerClient(): ConcordiumLedgerClientMain {
        if (!this.concordiumClient) {
            throw new Error('A connection to the Ledger is not available.');
        }
        return this.concordiumClient;
    }

    async subscribeLedger(eventEmitter: EventEmitter): Promise<void> {
        const speculosEmulator = axios.create({
            baseURL: process.env.LEDGER_EMULATOR_URL,
        });

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const source = axios.CancelToken.source();
            const timeout = setTimeout(() => {
                source.cancel();
            }, 5000);

            try {
                await speculosEmulator.get('/', {
                    cancelToken: source.token,
                });
                clearTimeout(timeout);

                if (!this.isConnected) {
                    this.concordiumClient = new ConcordiumLedgerClientMain(
                        eventEmitter
                    );

                    const appAndVersionResult = await this.concordiumClient.getAppAndVersion();
                    const appAndVersion = appAndVersionResult.result;
                    if (!appAndVersion) {
                        // We could not extract the version information.
                        eventEmitter.emit(
                            ledgerIpcCommands.listenChannel,
                            LedgerSubscriptionAction.RESET
                        );
                        return;
                    }

                    if (isConcordiumApp(appAndVersion)) {
                        eventEmitter.emit(
                            ledgerIpcCommands.listenChannel,
                            LedgerSubscriptionAction.CONNECTED_SUBSCRIPTION,
                            'Ledger Emulator'
                        );
                        this.isConnected = true;
                    }
                }
            } catch (e) {
                if (this.isConnected) {
                    this.isConnected = false;
                    // The emulator was not reachable.
                    if (this.concordiumClient) {
                        this.concordiumClient.closeTransport();
                    }
                    eventEmitter.emit(
                        ledgerIpcCommands.listenChannel,
                        LedgerSubscriptionAction.RESET
                    );
                }
            }

            await sleep(5000);
        }
    }

    closeTransport(): void {
        if (this.concordiumClient) {
            this.concordiumClient.closeTransport();
        }
    }
}
