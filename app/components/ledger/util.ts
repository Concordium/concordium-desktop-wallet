import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AppAndVersion } from '~/features/ledger/GetAppAndVersion';

export type LedgerStatusType =
    | 'LOADING'
    | 'ERROR'
    | 'CONNECTED'
    | 'OPEN_APP'
    | 'AWAITING_USER_INPUT';

export type LedgerSubmitHandler = (
    cb: (
        client: ConcordiumLedgerClient,
        setStatusText: (text: string) => void
    ) => Promise<void>
) => Promise<void>;

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
