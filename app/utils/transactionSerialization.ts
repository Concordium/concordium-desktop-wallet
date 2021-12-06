import { Buffer } from 'buffer/';
import {
    AccountTransaction,
    TransactionKindId as TransactionKind,
    BlockItemKind,
    ScheduledTransferPayload,
    SimpleTransferPayload,
    SchedulePoint,
    TransactionPayload,
    TransferToEncryptedPayload,
    UpdateAccountCredentialsPayload,
    TransferToPublicPayload,
    EncryptedTransferPayload,
    TransactionAccountSignature,
    Signature,
    TransactionCredentialSignature,
    AddBakerPayload,
    UpdateBakerKeysPayload,
    BakerVerifyKeys,
    BakerKeyProofs,
    UpdateBakerStakePayload,
    UpdateBakerRestakeEarningsPayload,
    SimpleTransferWithMemoPayload,
    ScheduledTransferWithMemoPayload,
    EncryptedTransferWithMemoPayload,
} from './types';
import {
    encodeWord32,
    encodeWord64,
    put,
    putHexString,
    putInt8,
    putBase58Check,
    hashSha256,
    serializeMap,
    base58ToBuffer,
    serializeList,
    serializeCredentialDeploymentInformation,
    serializeBoolean,
    encodeWord16,
} from './serializationHelpers';
import { encodeAsCBOR } from './cborHelper';

function serializeMemo(memo: string) {
    const encoded = encodeAsCBOR(memo);
    const length = encodeWord16(encoded.length);
    return Buffer.concat([length, encoded]);
}

function serializeSimpleTransfer(payload: SimpleTransferPayload) {
    const kind = putInt8(TransactionKind.Simple_transfer);
    const address = base58ToBuffer(payload.toAddress);
    const amount = encodeWord64(BigInt(payload.amount));
    return Buffer.concat([kind, address, amount]);
}

function serializeSimpleTransferWithMemo(
    payload: SimpleTransferWithMemoPayload
) {
    const kind = putInt8(TransactionKind.Simple_transfer_with_memo);
    const address = base58ToBuffer(payload.toAddress);
    const memo = serializeMemo(payload.memo);
    const amount = encodeWord64(BigInt(payload.amount));
    return Buffer.concat([kind, address, memo, amount]);
}

export function serializeScheduledTransferPayloadBase(
    payload: ScheduledTransferPayload,
    kind: TransactionKind = TransactionKind.Transfer_with_schedule
) {
    const address = base58ToBuffer(payload.toAddress);
    const scheduleLength = putInt8(payload.schedule.length);
    return Buffer.concat([putInt8(kind), address, scheduleLength]);
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

function serializeTransferWithScheduleWithMemo(
    payload: ScheduledTransferWithMemoPayload
) {
    const kind = putInt8(TransactionKind.Transfer_with_schedule_and_memo);
    const address = base58ToBuffer(payload.toAddress);
    const memo = serializeMemo(payload.memo);
    const scheduleLength = putInt8(payload.schedule.length);

    return Buffer.concat(
        [kind, address, memo, scheduleLength].concat(
            payload.schedule.map(serializeSchedulePoint)
        )
    );
}

function serializeTransferToEncypted(payload: TransferToEncryptedPayload) {
    const size = 1 + 8;
    const serialized = new Uint8Array(size);

    serialized[0] = TransactionKind.Transfer_to_encrypted;
    put(serialized, 1, encodeWord64(BigInt(payload.amount)));
    return Buffer.from(serialized);
}

function serializeUpdateCredentials(payload: UpdateAccountCredentialsPayload) {
    const transactionType = Buffer.alloc(1);
    transactionType.writeUInt8(TransactionKind.Update_credentials, 0);

    const serializedNewCredentials = serializeList(
        payload.addedCredentials,
        putInt8,
        ({ index, value }) =>
            Buffer.concat([
                putInt8(index),
                serializeCredentialDeploymentInformation(value),
            ])
    );

    const serializedRemovedCredentials = serializeList(
        payload.removedCredIds,
        putInt8,
        putHexString
    );

    const threshold = Buffer.alloc(1);
    threshold.writeUInt8(payload.threshold, 0);

    return Buffer.concat([
        transactionType,
        serializedNewCredentials,
        serializedRemovedCredentials,
        threshold,
    ]);
}

export function serializeTransferToPublicData(
    payload: TransferToPublicPayload
) {
    if (payload.index === undefined || !payload.remainingEncryptedAmount) {
        throw new Error('unexpected missing data of unshield amount data');
    }
    const remainingEncryptedAmount = Buffer.from(
        payload.remainingEncryptedAmount,
        'hex'
    );

    return Buffer.concat([
        remainingEncryptedAmount,
        encodeWord64(BigInt(payload.transferAmount)),
        encodeWord64(BigInt(payload.index)),
    ]);
}

function serializeTransferToPublic(payload: TransferToPublicPayload) {
    if (!payload.proof) {
        throw new Error('unexpected missing proof of unshield amount data');
    }

    const proof = Buffer.from(payload.proof, 'hex');
    const data = serializeTransferToPublicData(payload);
    const size = 1 + data.length + proof.length;
    const serialized = new Uint8Array(size);

    serialized[0] = TransactionKind.Transfer_to_public;
    put(serialized, 1, data);
    put(serialized, 1 + data.length, proof);
    return Buffer.from(serialized);
}

export function serializeEncryptedTransferData(
    payload: EncryptedTransferPayload
) {
    if (
        payload.index === undefined ||
        !payload.remainingEncryptedAmount ||
        !payload.transferAmount
    ) {
        throw new Error('unexpected missing data of Shielded Transfer data');
    }
    const remainingEncryptedAmount = Buffer.from(
        payload.remainingEncryptedAmount,
        'hex'
    );
    const transferAmount = Buffer.from(payload.transferAmount, 'hex');
    const serializedAddress = base58ToBuffer(payload.toAddress);

    return Buffer.concat([
        serializedAddress,
        remainingEncryptedAmount,
        transferAmount,
        encodeWord64(BigInt(payload.index)),
    ]);
}

function serializeEncryptedTransfer(payload: EncryptedTransferPayload) {
    if (!payload.proof) {
        throw new Error('unexpected missing proof of Shielded Transfer data');
    }

    const proof = Buffer.from(payload.proof, 'hex');
    const data = serializeEncryptedTransferData(payload);

    return Buffer.concat([
        putInt8(TransactionKind.Encrypted_transfer),
        data,
        proof,
    ]);
}

function serializeEncryptedTransferWithMemo(
    payload: EncryptedTransferWithMemoPayload
) {
    if (!payload.proof) {
        throw new Error('unexpected missing proof of Shielded Transfer data');
    }
    if (
        payload.index === undefined ||
        !payload.remainingEncryptedAmount ||
        !payload.transferAmount
    ) {
        throw new Error('unexpected missing data of Shielded Transfer data');
    }

    const proof = Buffer.from(payload.proof, 'hex');
    const remainingEncryptedAmount = Buffer.from(
        payload.remainingEncryptedAmount,
        'hex'
    );
    const transferAmount = Buffer.from(payload.transferAmount, 'hex');
    const serializedAddress = base58ToBuffer(payload.toAddress);

    return Buffer.concat([
        putInt8(TransactionKind.Encrypted_transfer_with_memo),
        serializedAddress,
        serializeMemo(payload.memo),
        remainingEncryptedAmount,
        transferAmount,
        encodeWord64(BigInt(payload.index)),
        proof,
    ]);
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

    return Buffer.from(serialized);
}

export function serializeBakerVerifyKeys(payload: BakerVerifyKeys) {
    return Buffer.concat([
        putHexString(payload.electionVerifyKey),
        putHexString(payload.signatureVerifyKey),
        putHexString(payload.aggregationVerifyKey),
    ]);
}

export function serializeBakerKeyProofs(payload: BakerKeyProofs) {
    return Buffer.concat([
        putHexString(payload.proofSignature),
        putHexString(payload.proofElection),
        putHexString(payload.proofAggregation),
    ]);
}

export function serializeAddBakerProofsStakeRestake(payload: AddBakerPayload) {
    return Buffer.concat([
        serializeBakerKeyProofs(payload),
        encodeWord64(BigInt(payload.bakingStake)),
        serializeBoolean(payload.restakeEarnings),
    ]);
}

export function serializeAddBaker(payload: AddBakerPayload) {
    return Buffer.concat([
        Buffer.from(Uint8Array.of(TransactionKind.Add_baker)),
        serializeBakerVerifyKeys(payload),
        serializeAddBakerProofsStakeRestake(payload),
    ]);
}

export function serializeUpdateBakerKeys(payload: UpdateBakerKeysPayload) {
    return Buffer.concat([
        Buffer.from(Uint8Array.of(TransactionKind.Update_baker_keys)),
        serializeBakerVerifyKeys(payload),
        serializeBakerKeyProofs(payload),
    ]);
}

export function serializeRemoveBaker() {
    return Buffer.from(Uint8Array.of(TransactionKind.Remove_baker));
}

export function serializeUpdateBakerStake(payload: UpdateBakerStakePayload) {
    return Buffer.concat([
        Buffer.from(Uint8Array.of(TransactionKind.Update_baker_stake)),
        encodeWord64(BigInt(payload.stake)),
    ]);
}

export function serializeUpdateBakerRestakeEarnings(
    payload: UpdateBakerRestakeEarningsPayload
) {
    return Buffer.concat([
        Buffer.from(
            Uint8Array.of(TransactionKind.Update_baker_restake_earnings)
        ),
        serializeBoolean(payload.restakeEarnings),
    ]);
}

export function serializeTransferPayload(
    kind: TransactionKind,
    payload: TransactionPayload
): Buffer {
    switch (kind) {
        case TransactionKind.Simple_transfer:
            return serializeSimpleTransfer(payload as SimpleTransferPayload);
        case TransactionKind.Simple_transfer_with_memo:
            return serializeSimpleTransferWithMemo(
                payload as SimpleTransferWithMemoPayload
            );
        case TransactionKind.Update_credentials:
            return serializeUpdateCredentials(
                payload as UpdateAccountCredentialsPayload
            );
        case TransactionKind.Transfer_with_schedule:
            return serializeTransferWithSchedule(
                payload as ScheduledTransferPayload
            );
        case TransactionKind.Transfer_with_schedule_and_memo:
            return serializeTransferWithScheduleWithMemo(
                payload as ScheduledTransferWithMemoPayload
            );
        case TransactionKind.Transfer_to_encrypted:
            return serializeTransferToEncypted(
                payload as TransferToEncryptedPayload
            );
        case TransactionKind.Transfer_to_public:
            return serializeTransferToPublic(
                payload as TransferToPublicPayload
            );
        case TransactionKind.Encrypted_transfer:
            return serializeEncryptedTransfer(
                payload as EncryptedTransferPayload
            );
        case TransactionKind.Encrypted_transfer_with_memo:
            return serializeEncryptedTransferWithMemo(
                payload as EncryptedTransferWithMemoPayload
            );
        case TransactionKind.Add_baker:
            return serializeAddBaker(payload as AddBakerPayload);
        case TransactionKind.Update_baker_keys:
            return serializeUpdateBakerKeys(payload as UpdateBakerKeysPayload);

        case TransactionKind.Remove_baker:
            return serializeRemoveBaker();
        case TransactionKind.Update_baker_stake:
            return serializeUpdateBakerStake(
                payload as UpdateBakerStakePayload
            );
        case TransactionKind.Update_baker_restake_earnings:
            return serializeUpdateBakerRestakeEarnings(
                payload as UpdateBakerRestakeEarningsPayload
            );
        default:
            throw new Error('Unsupported transaction kind');
    }
}

function serializeSignature(signatures: TransactionAccountSignature) {
    // Size should be 1 for number of credentials, then for each credential:
    // 1 for the CredentialIndex, 1 for the number of signatures, then for each signature:
    // index ( 1 ) + Length of signature ( 2 ) + actual signature ( variable )

    const putSignature = (signature: Signature) => {
        const signatureBytes = Buffer.from(signature, 'hex');
        const length = Buffer.alloc(2);
        length.writeUInt16BE(signatureBytes.length, 0);
        return Buffer.concat([length, signatureBytes]);
    };
    const putCredentialSignatures = (credSig: TransactionCredentialSignature) =>
        serializeMap(credSig, putInt8, putInt8, putSignature);
    return serializeMap(signatures, putInt8, putInt8, putCredentialSignatures);
}

function serializeUnversionedTransaction(
    transaction: AccountTransaction,
    signature: TransactionAccountSignature
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

    const serialSignature = serializeSignature(signature);
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
    signature: TransactionAccountSignature
) {
    const unversioned = serializeUnversionedTransaction(transaction, signature);
    const serialized = new Uint8Array(1 + unversioned.length);
    serialized[0] = 0; // Version number
    put(serialized, 1, unversioned);
    return serialized;
}

/**
 * Returns the transactionHash, which includes the signature, and is used as the
 * submissionId on chain.
 */
export async function getAccountTransactionHash(
    transaction: AccountTransaction,
    signature: TransactionAccountSignature
): Promise<Buffer> {
    const serialized = serializeUnversionedTransaction(transaction, signature);
    return hashSha256(serialized);
}

/**
 * Returns the "digest to be signed"", which is the hash that is signed.
 */
export async function getAccountTransactionSignDigest(
    transaction: AccountTransaction
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

    return hashSha256(Buffer.concat([header, payload]));
}
