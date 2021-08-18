/* eslint-disable import/prefer-default-export */
import { Buffer } from 'buffer/';
import { encode, decode } from 'cbor';

export function encodeAsCBOR(value: string | number) {
    // Prefer saving as numbers:
    const asNumber = Number(value);
    if (Number.isInteger(asNumber) && asNumber <= Number.MAX_SAFE_INTEGER) {
        return Buffer.from(encode(asNumber));
    }
    return Buffer.from(encode(value));
}

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
