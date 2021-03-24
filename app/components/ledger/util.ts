import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AppAndVersion } from '~/features/ledger/GetAppAndVersion';

export enum LedgerStatusType {
    LOADING,
    ERROR,
    CONNECTED,
    OPEN_APP,
    AWAITING_USER_INPUT,
}

export type LedgerCallback = (
    client: ConcordiumLedgerClient,
    setStatusText: (message: string) => void
) => Promise<void>;

export type LedgerSubmitHandler = () => Promise<void>;

export function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}

interface TransportStatusError {
    name: string;
    message: string;
    stack: string;
    statusCode: number;
    statusText: string;
}

export function instanceOfTransportStatusError(
    object: Error
): object is TransportStatusError {
    return (
        'name' in object &&
        'message' in object &&
        'stack' in object &&
        'statusCode' in object &&
        'statusText' in object
    );
}
