const userRejection = 0x6985;
const invalidState = 0x6b01;
const invalidPath = 0x6b02;
const invalidParam = 0x6b03;
const invalidTransaction = 0x6b04;

const incompatibleText =
    'The desktop application is incompatible with the Ledger application.';

const errorCodeMap = new Map<number, string>();
errorCodeMap.set(
    userRejection,
    'The transaction was declined on the Ledger device.'
);
errorCodeMap.set(invalidState, `Invalid state. ${incompatibleText}`);
errorCodeMap.set(invalidPath, `Invalid path. ${incompatibleText}`);
errorCodeMap.set(invalidParam, `Invalid parameter. ${incompatibleText}`);
errorCodeMap.set(
    invalidTransaction,
    `Invalid transaction. ${incompatibleText}`
);

/**
 * Maps a non-successful status code from the Ledger device to a human readable error description.
 * @param statusCode status code returned by the Ledger
 */
export default function getErrorDescription(statusCode: number): string {
    const errorDescription = errorCodeMap.get(statusCode);
    if (errorDescription) {
        return errorDescription;
    }
    return 'An unknown error occurred while communicating with your Ledger device.';
}
