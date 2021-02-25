import {
    AccountTransaction,
    TransactionKindId as TransactionKind,
    BlockItemKind,
    ScheduledTransferPayload,
    SimpleTransferPayload,
    SchedulePoint,
    TransactionPayload,
    TransferToEncryptedPayload,
} from './types';
import {
    encodeWord16,
    encodeWord32,
    encodeWord64,
    put,
    putBase58Check,
    hashSha256,
} from './serializationHelpers';

function serializeSimpleTransfer(payload: SimpleTransferPayload) {
    const size = 1 + 32 + 8;
    const serialized = new Uint8Array(size);

    serialized[0] = TransactionKind.Simple_transfer;
    putBase58Check(serialized, 1, payload.toAddress);
    put(serialized, 32 + 1, encodeWord64(BigInt(payload.amount)));
    return serialized;
}

export function serializeScheduledTransferPayloadBase(
    payload: ScheduledTransferPayload
) {
    const size = 1 + 32 + 1;
    const initialPayload = new Uint8Array(size);

    initialPayload[0] = TransactionKind.Transfer_with_schedule;
    putBase58Check(initialPayload, 1, payload.toAddress);
    initialPayload[33] = payload.schedule.length;
    return initialPayload;
}

export function serializeSchedulePoint(period: SchedulePoint) {
    return Buffer.concat([
        encodeWord64(BigInt(period.timestamp)),
        encodeWord64(BigInt(period.amount)),
    ]);
}

function serializeTransferWithSchedule(payload: ScheduledTransferPayload) {
    return Buffer.concat(
        [serializeScheduledTransferPayloadBase(payload)].concat(
            payload.schedule.map(serializeSchedulePoint)
        )
    );
}

function serializeTransferToEncypted(payload: TransferToEncryptedPayload) {
    const size = 1 + 8;
    const serialized = new Uint8Array(size);

    serialized[0] = TransactionKind.Transfer_to_encrypted;
    put(serialized, 1, encodeWord64(BigInt(payload.amount)));
    return serialized;
}

export function serializeTransactionHeader(
    sender: string,
    nonce: string,
    energyAmount: string,
    payloadSize: number,
    expiry: string
) {
    const size = 32 + 8 + 8 + 4 + 8;
    const serialized = new Uint8Array(size);

    putBase58Check(serialized, 0, sender);
    put(serialized, 32, encodeWord64(BigInt(nonce)));
    put(serialized, 32 + 8, encodeWord64(BigInt(energyAmount)));
    put(serialized, 32 + 8 + 8, encodeWord32(payloadSize));
    put(serialized, 32 + 8 + 8 + 4, encodeWord64(BigInt(expiry)));

    return serialized;
}

export function serializeTransferPayload(
    kind: TransactionKind,
    payload: TransactionPayload
) {
    switch (kind) {
        case TransactionKind.Simple_transfer:
            return serializeSimpleTransfer(payload as SimpleTransferPayload);
        case TransactionKind.Transfer_with_schedule:
            return serializeTransferWithSchedule(
                payload as ScheduledTransferPayload
            );
        case TransactionKind.Transfer_to_encrypted:
            return serializeTransferToEncypted(
                payload as TransferToEncryptedPayload
            );
        default:
            throw new Error('Unsupported transactionkind');
    }
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
    for (let i = 0; i < sigs.length; i += 1) {
        serialized[index] = i; // Key index (word8)
        index += 1;
        put(serialized, index, encodeWord16(sigs[i].length)); // length of signature/shortbytestring (word16)
        index += 2;
        put(serialized, index, sigs[i]);
        index += sigs[i].length;
    }
    return serialized;
}

type SignFunction = (transaction: AccountTransaction, hash: Buffer) => [Buffer];

function serializeUnversionedTransaction(
    transaction: AccountTransaction,
    signFunction: SignFunction
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
        1 + serialSignature.length + header.length + payload.length
    );
    serialized[0] = BlockItemKind.AccountTransactionKind;
    put(serialized, 1, serialSignature);
    put(serialized, 1 + serialSignature.length, header);
    put(serialized, 1 + serialSignature.length + header.length, payload);
    return serialized;
}

export function serializeTransaction(
    transaction: AccountTransaction,
    signFunction: SignFunction
) {
    const unversioned = serializeUnversionedTransaction(
        transaction,
        signFunction
    );
    const serialized = new Uint8Array(1 + unversioned.length);
    serialized[0] = 0; // Version number
    put(serialized, 1, unversioned);
    return serialized;
}

export function getTransactionHash(
    transaction: AccountTransaction,
    signFunction: SignFunction
) {
    const serialized = serializeUnversionedTransaction(
        transaction,
        signFunction
    );
    return hashSha256(serialized);
}
