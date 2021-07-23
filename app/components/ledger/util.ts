import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AppAndVersion } from '~/features/ledger/GetAppAndVersion';

export enum LedgerStatusType {
    DISCONNECTED,
    ERROR,
    CONNECTED,
    OPEN_APP,
    LOADING,
    AWAITING_USER_INPUT,
}

export type LedgerCallback<ReturnType = void> = (
    client: ConcordiumLedgerClient,
    setStatusText: (message: string | JSX.Element) => void
) => Promise<ReturnType>;

export type LedgerSubmitHandler = () => Promise<void>;

export function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}
