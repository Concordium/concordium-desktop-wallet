/* eslint-disable import/prefer-default-export */
import { Buffer } from 'buffer/';
import { encode, decode } from 'cbor';

/**
 * Given a string or number, return a buffer containing the value under cbor encoding.
 * N.B. given a string, this will attempt to convert it to a number, to decrease the encoded size.
 */
export function encodeAsCBOR(value: string | number): Buffer {
    // Prefer saving as numbers:
    const asNumber = Number(value);
    if (Number.isInteger(asNumber)) {
        if (
            asNumber >= Number.MAX_SAFE_INTEGER ||
            asNumber <= Number.MIN_SAFE_INTEGER
        ) {
            throw new Error('Unsafe number given to CBOR encoder');
        }
        return Buffer.from(encode(asNumber));
    }
    return Buffer.from(encode(value));
}

/**
 * Decode cbot encoding.
 * @param value is assumed to be a Hex string, containing cbor encoded bytes.
 */
export function decodeCBOR(value: string) {
    return decode(Buffer.from(value, 'hex'));
}

export function getEncodedSize(value?: string | number) {
    if (!value && value !== 0) {
        return 0;
    }
    const encoded = encodeAsCBOR(value);
    return encoded.length;
}
