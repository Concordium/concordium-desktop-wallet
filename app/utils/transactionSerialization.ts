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
    encodeWord32,
    encodeWord64,
    put,
    putBase58Check,
    hashSha256,
    serializeMap,
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
    expiry: bigint
) {
    const size = 32 + 8 + 8 + 4 + 8;
    const serialized = new Uint8Array(size);

    putBase58Check(serialized, 0, sender);
    put(serialized, 32, encodeWord64(BigInt(nonce)));
    put(serialized, 32 + 8, encodeWord64(BigInt(energyAmount)));
    put(serialized, 32 + 8 + 8, encodeWord32(payloadSize));
    put(serialized, 32 + 8 + 8 + 4, encodeWord64(expiry));

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

type Signature = Buffer;
type KeyIndex = number; // word8
type CredentialIndex = number; // word8
type TransactionCredentialSignatures = Record<KeyIndex, Signature>;
type TransactionSignature = Record<
    CredentialIndex,
    TransactionCredentialSignatures
>;

function serializeSignature(signatures: TransactionSignature) {
    // FIXME: update to handle double-indexed signatures;
    // Size should be 1 for number of credentials, then for each credential:
    // 1 for the CredentialIndex, 1 for the number of signatures, then for each signature:
    // index ( 1 ) + Length of signature ( 2 ) + actual signature ( variable )

    const putInt8 = (i: number) => Buffer.from(Uint8Array.of(i));
    const putSignature = (signature: Signature) => {
        const length = Buffer.alloc(2);
        length.writeInt16BE(signature.length, 0);
        return Buffer.concat([length, signature]);
    };
    const putCredentialSignatures = (
        credSig: TransactionCredentialSignatures
    ) => serializeMap(credSig, putInt8, putInt8, putSignature);
    return serializeMap(signatures, putInt8, putInt8, putCredentialSignatures);
}

type SignFunction = (
    transaction: AccountTransaction,
    hash: Buffer
) => TransactionSignature;

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
