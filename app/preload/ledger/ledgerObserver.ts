import { BrowserWindow } from 'electron';
import ConcordiumLedgerClientMain from '../../features/ledger/ConcordiumLedgerClientMain';

export interface LedgerObserver {
    getLedgerClient(): ConcordiumLedgerClientMain | undefined;
    subscribeLedger(mainWindow: BrowserWindow): Promise<void>;
    closeTransport(): void;
}
