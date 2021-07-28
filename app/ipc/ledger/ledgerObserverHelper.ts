import { BrowserWindow } from 'electron';
import LedgerEmulatorObserverImpl from './ledgerEmulatorObserverImpl';
import LedgerObserverImpl from './ledgerObserverImpl';

export const ledgerObserver = process.env.LEDGER_EMULATOR_URL
    ? new LedgerEmulatorObserverImpl()
    : new LedgerObserverImpl();

export function closeTransport() {
    ledgerObserver.closeTransport();
}

export function getLedgerClient() {
    return ledgerObserver.getLedgerClient();
}

export function subscribeLedger(mainWindow: BrowserWindow) {
    ledgerObserver.subscribeLedger(mainWindow);
}
