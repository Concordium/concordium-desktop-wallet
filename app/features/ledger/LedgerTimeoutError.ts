/**
 * Thrown when a Ledger APDU call does not receive a response within the
 * configured timeout window. This prevents the application from hanging
 * indefinitely when the device stops responding (e.g. screen lock, cable issue).
 */
export default class LedgerTimeoutError extends Error {
    name = 'LedgerTimeoutError';

    type = 'LedgerTimeout';

    constructor(timeoutMs: number) {
        super(
            `Ledger device did not respond within ${timeoutMs / 1000} seconds. ` +
                `Please check that the device is connected and the Concordium app is open.`
        );
    }
}

export function instanceOfLedgerTimeoutError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any
): object is LedgerTimeoutError {
    return object?.type === 'LedgerTimeout';
}
