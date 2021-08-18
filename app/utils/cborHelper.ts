/* eslint-disable import/prefer-default-export */
import { Buffer } from 'buffer/';
import { encode } from 'cbor';

export function encodeAsCBOR(value: string | number) {
    // Prefer saving as numbers:
    const asNumber = Number(value);
    if (Number.isInteger(asNumber)) {
        return Buffer.from(encode(Number(value)));
    }
    return Buffer.from(encode(value));
}

export function getEncodedSize(value?: string | number) {
    if (!value && value !== 0) {
        return 0;
    }
    const encoded = encodeAsCBOR(value);
    return encoded.length;
}
