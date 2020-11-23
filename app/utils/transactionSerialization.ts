import bs58check from 'bs58check';
import * as crypto from 'crypto';

export function serializeTransaction(data) {
  const payload = serializeTransferPayload(data.payload);
  const header = serializeTransactionHeader(data, payload.length);

  const signatures = makeSignatures(data.keys, header, payload);
  const serialSignature = serializeSignature(signatures);

  const serialized = new Uint8Array(
    2 + serialSignature.length + header.length + payload.length
  );
  serialized[0] = 0; // Version number
  serialized[1] = 0; // AccountTransactionKind
  put(serialized, 2, serialSignature);
  put(serialized, 2 + serialSignature.length, header);
  put(serialized, 2 + serialSignature.length + header.length, payload);
  return serialized;
}

function serializeSignature(sigs: Uint8Array[]) {
  const signatureCount = sigs.length;
  const size = 1 + signatureCount * (1 + 2 + sigs[0].length); // TODO: dont assume same length
  // 1 for length, then for each signature, index ( 1 ) + Length of signature ( 2 ) + actual signature ( 64 )
  const serialized = new Uint8Array(size);
  serialized[0] = sigs.length; // Number of signatures (word8)
  let index = 1;
  for (let i = 0; i < sigs.length; ++i) {
    serialized[index] = i; // Key index (word8)
    index += 1;
    put(serialized, index, encodeWord16(sigs[i].length)); // length of signature/shortbytestring (word16)
    index += 2;
    put(serialized, index, sigs[i]);
    index += sigs[i].length;
  }
  return serialized;
}

function makeSignatures(keyPairs, header, payload): Buffer {
  const hash = HashTransaction(header, payload);

  const signatures = new Array(keyPairs.length);

  for (const index in keyPairs) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519'); // TODO: Use given Keys instead of generating random
    const signature = crypto.sign(null, hash, privateKey);
    signatures[index] = signature;
  }
  return signatures;
}

function HashTransaction(header, payload) {
  const hash = crypto.createHash('sha256');

  hash.update(header);
  hash.update(payload);

  return hash.digest();
}

function serializeTransactionHeader(data, payloadSize) {
  const size = 32 + 8 + 8 + 4 + 8;
  const serialized = new Uint8Array(size);

  putAccountAddress(serialized, 0, data.sender);
  put(serialized, 32, encodeWord64(data.nonce));
  put(serialized, 32 + 8, encodeWord64(data.energyAmount));
  put(serialized, 32 + 8 + 8, encodeWord32(payloadSize));
  put(serialized, 32 + 8 + 8 + 4, encodeWord64(data.expiry));

  return serialized;
}

function putAccountAddress(
  array: Uint8Array,
  startIndex: number,
  address: string
) {
  const decoded = bs58check.decode(address);
  for (let i = 1; i < decoded.length; i++) {
    array[startIndex + i - 1] = decoded[i];
  }
}

function serializeTransferPayload(payload) {
  const size = 1 + 32 + 8;
  const serialized = new Uint8Array(size);

  serialized[0] = 3; // Transaction Type = simpletransfer
  putAccountAddress(serialized, 1, payload.toaddress.address);
  put(serialized, 32 + 1, encodeWord64(payload.amount));
  return serialized;
}

function put(array, start, input) {
  for (let i = 0; i < input.length; i++) {
    array[start + i] = input[i];
  }
}

function encodeWord16(num) {
  const arr = new ArrayBuffer(2); // an Int32 takes 4 bytes
  const view = new DataView(arr);
  view.setUint16(0, num, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

function encodeWord32(num) {
  const arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
  const view = new DataView(arr);
  view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

function encodeWord64(num) {
  const arr = new ArrayBuffer(8); // an Int64 takes 8 bytes
  const view = new DataView(arr);
  view.setBigUint64(0, BigInt(num), false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}
