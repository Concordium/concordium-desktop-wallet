export default class TransportStatusError extends Error {
    name = 'TransportStatusError';

    message = '';

    statusCode: number;

    stack = '';

    statusText = '';

    constructor(statusCode: number) {
        super();
        this.statusCode = statusCode;
    }
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
