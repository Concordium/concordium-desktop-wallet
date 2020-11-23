import { AccountTransaction, TransactionKind } from './transaction.ts';
import { encodeWord16, encodeWord32, encodeWord64, put, putBase58Check, hashSha256 } from './serializationHelpers';

export function serializeTransaction(
  transaction: AccountTransaction,
  signFunction: (transaction: AccountTransaction, hash: Buffer) => Buffer
) {
  const payload = serializeTransferPayload(
    transaction.transactionKind,
    transaction.payload
  );
  const header = serializeTransactionHeader(
    transaction.sender,
    transaction.nonce,
    transaction.energyAmount,
    payload.length,
    transaction.expiry
  );

  const hash = hashSha256(header, payload);
  const signatures = signFunction(transaction, hash);
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
    // Size should be 1 for number of signatures, then for each signature, index ( 1 ) + Length of signature ( 2 ) + actual signature ( variable )

  const signaturesCombinedSizes = sigs.reduce(
    (acc, sig) => acc + sig.length,
    0
  );
    const size = 1 + sigs.length * 3 + signaturesCombinedSizes;

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

function serializeTransactionHeader(
  sender,
  nonce,
  energyAmount,
  payloadSize,
  expiry
) {
  const size = 32 + 8 + 8 + 4 + 8;
  const serialized = new Uint8Array(size);

  putBase58Check(serialized, 0, sender);
  put(serialized, 32, encodeWord64(nonce));
  put(serialized, 32 + 8, encodeWord64(energyAmount));
  put(serialized, 32 + 8 + 8, encodeWord32(payloadSize));
  put(serialized, 32 + 8 + 8 + 4, encodeWord64(expiry));

  return serialized;
}

function serializeTransferPayload(kind: TransactionKind, payload) {
  switch (kind) {
    case TransactionKind.Simple_transfer:
      return serializeSimpleTransfer(payload);
    case TransactionKind.Deploy_credential:
      return serializeDeployCredential(payload);
    case TransactionKind.Transfer_with_schedule:
      return serializeTransferWithSchedule(payload);
    default:
      throw new Error('Unsupported transactionkind');
  }
}

function serializeSimpleTransfer(payload) {
  const size = 1 + 32 + 8;
  const serialized = new Uint8Array(size);

  serialized[0] = TransactionKind.Simple_transfer;
  putBase58Check(serialized, 1, payload.toAddress);
  put(serialized, 32 + 1, encodeWord64(payload.amount));
  return serialized;
}

function serializeTransferWithSchedule(payload) {
  const listLength = payload.schedule.length;

  const size = 1 + 32 + 1 + listLength * (8 + 8);
  const serialized = new Uint8Array(size);

  function serializeSchedule(period) {
    put(serialized, index, encodeWord64(period.timestamp));
    index += 8;
    put(serialized, index, encodeWord64(period.amount));
    index += 8;
  }

  let index = 0;
  serialized[index] = TransactionKind.Transfer_with_schedule;
  index += 1;
  putBase58Check(serialized, index, payload.toAddress);
  index += 32;
  serialized[index] = listLength;
  index += 1;
  payload.schedule.forEach(serializeSchedule);
  return serialized;
}
