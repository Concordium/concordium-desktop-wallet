import * as crypto from 'crypto';
import bs58check from 'bs58check';

export function putBase58Check(
  array: Uint8Array,
  startIndex: number,
  base58Sstring: string
) {
  const decoded = bs58check.decode(base58Sstring);
  for (let i = 1; i < decoded.length; i++) {
    array[startIndex + i - 1] = decoded[i];
  }
}

export function put(array, start, input) {
  for (let i = 0; i < input.length; i++) {
    array[start + i] = input[i];
  }
}

export function encodeWord16(value): Uint8Array {
  const arr = new ArrayBuffer(2); // an Int16 takes 2 bytes
  const view = new DataView(arr);
  view.setUint16(0, value, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

export function encodeWord32(value): Uint8Array {
  const arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
  const view = new DataView(arr);
  view.setUint32(0, value, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

export function encodeWord64(value): Uint8Array {
  const arr = new ArrayBuffer(8); // an Int64 takes 8 bytes
  const view = new DataView(arr);
  view.setBigUint64(0, BigInt(value), false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

export function hashSha256(...inputs): Buffer {
  const hash = crypto.createHash('sha256');

  inputs.forEach((input) => hash.update(input));

  return hash.digest();
}

export function parseHexString(hexString): Buffer {
  return Buffer.from(hexString, 'hex');
}
