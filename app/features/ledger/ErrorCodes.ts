enum StatusCodes {
    UserRejection = 0x6985,
    InvalidState = 0x6b01,
    InvalidPath = 0x6b02,
    InvalidParam = 0x6b03,
    InvalidTransaction = 0x6b04,
}

const incompatibleText =
    'The desktop application is incompatible with the Ledger application.';

const errorCodeMap = new Map<number, string>();
errorCodeMap.set(
    StatusCodes.UserRejection,
    'The transaction was declined on the Ledger device.'
);
errorCodeMap.set(
    StatusCodes.InvalidState,
    `Invalid state. ${incompatibleText}`
);
errorCodeMap.set(StatusCodes.InvalidPath, `Invalid path. ${incompatibleText}`);
errorCodeMap.set(
    StatusCodes.InvalidParam,
    `Invalid parameter. ${incompatibleText}`
);
errorCodeMap.set(
    StatusCodes.InvalidTransaction,
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
