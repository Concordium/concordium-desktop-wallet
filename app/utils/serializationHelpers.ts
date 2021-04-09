import * as crypto from 'crypto';
import bs58check from 'bs58check';
import { VerifyKey, SchemeId } from './types';

export function putBase58Check(
    array: Uint8Array,
    startIndex: number,
    base58Sstring: string
) {
    const decoded = bs58check.decode(base58Sstring);
    for (let i = 1; i < decoded.length; i += 1) {
        array[startIndex + i - 1] = decoded[i];
    }
}

export function base58ToBuffer(base58Sstring: string) {
    return bs58check.decode(base58Sstring);
}

type Indexable = Buffer | Uint8Array;

export function put(array: Indexable, start: number, input: Indexable) {
    for (let i = 0; i < input.length; i += 1) {
        array[start + i] = input[i];
    }
}

export function encodeWord16(value: number): Uint8Array {
    const arr = new ArrayBuffer(2); // an Int16 takes 2 bytes
    const view = new DataView(arr);
    view.setUint16(0, value, false); // byteOffset = 0; litteEndian = false
    return new Uint8Array(arr);
}

export function encodeWord32(value: number): Uint8Array {
    const arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    const view = new DataView(arr);
    view.setUint32(0, value, false); // byteOffset = 0; litteEndian = false
    return new Uint8Array(arr);
}

export function encodeWord64(value: bigint): Uint8Array {
    const arr = new ArrayBuffer(8); // an Int64 takes 8 bytes
    const view = new DataView(arr);
    view.setBigUint64(0, value, false); // byteOffset = 0; litteEndian = false
    return new Uint8Array(arr);
}

export function hashSha256(...inputs: Indexable[]): Buffer {
    const hash = crypto.createHash('sha256');

    inputs.forEach((input) => hash.update(input));

    return hash.digest();
}

export function parseHexString(hexString: string): Buffer {
    return Buffer.from(hexString, 'hex');
}

// Given an integer, outputs the value as Hex,
// with prepended zeroes according to minLength.
export function toHex(value: number, minLength = 2) {
    let hex = value.toString(16);
    while (hex.length < minLength) {
        hex = `0${hex}`;
    }
    return hex;
}

export function serializeVerifyKey(key: VerifyKey) {
    const scheme = key.schemeId as keyof typeof SchemeId;
    let schemeId;
    if (SchemeId[scheme] !== undefined) {
        schemeId = SchemeId[scheme];
    } else {
        throw new Error(`Unknown key type: ${scheme}`);
    }
    const keyBuffer = Buffer.from(key.verifyKey, 'hex');
    const schemeBuffer = Buffer.alloc(1);
    schemeBuffer.writeInt8(schemeId, 0);
    return Buffer.concat([schemeBuffer, keyBuffer]);
}

export function serializeMap<K extends string | number | symbol, T>(
    map: Record<K, T>,
    putSize: (size: number) => Buffer,
    putKey: (k: K) => Buffer,
    putValue: (t: T) => Buffer
): Buffer {
    const keys = Object.keys(map) as K[];
    const buffers = [putSize(keys.length)];
    keys.forEach((key: K) => {
        buffers.push(putKey(key));
        buffers.push(putValue(map[key]));
    });
    return Buffer.concat(buffers);
}
