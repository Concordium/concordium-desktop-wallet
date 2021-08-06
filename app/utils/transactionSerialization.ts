import { Buffer } from 'buffer/';
import { AccountTransactionType, BlockItemKind } from '@concordium/node-sdk';
import {
    AccountTransaction,
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
} from './serializationHelpers';

function serializeSimpleTransfer(payload: SimpleTransferPayload) {
    const size = 1 + 32 + 8;
    const serialized = new Uint8Array(size);

    serialized[0] = AccountTransactionType.SimpleTransfer;
    putBase58Check(serialized, 1, payload.toAddress);
    put(serialized, 32 + 1, encodeWord64(BigInt(payload.amount)));
    return Buffer.from(serialized);
}

export function serializeScheduledTransferPayloadBase(
    payload: ScheduledTransferPayload
) {
    const size = 1 + 32 + 1;
    const initialPayload = new Uint8Array(size);

    initialPayload[0] = AccountTransactionType.TransferWithSchedule;
    putBase58Check(initialPayload, 1, payload.toAddress);
    initialPayload[33] = payload.schedule.length;
    return Buffer.from(initialPayload);
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

    serialized[0] = AccountTransactionType.TransferToEncrypted;
    put(serialized, 1, encodeWord64(BigInt(payload.amount)));
    return Buffer.from(serialized);
}

function serializeUpdateCredentials(payload: UpdateAccountCredentialsPayload) {
    const transactionType = Buffer.alloc(1);
    transactionType.writeUInt8(AccountTransactionType.UpdateCredentials, 0);

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
        throw new Error('unexpected missing data of Unshielding data');
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
        throw new Error('unexpected missing proof of Unshielding data');
    }

    const proof = Buffer.from(payload.proof, 'hex');
    const data = serializeTransferToPublicData(payload);
    const size = 1 + data.length + proof.length;
    const serialized = new Uint8Array(size);

    serialized[0] = AccountTransactionType.TransferToPublic;
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
    const serializedAddress: Buffer = Buffer.from(
        base58ToBuffer(payload.toAddress)
    );

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
    const size = 1 + data.length + proof.length;
    const serialized = new Uint8Array(size);

    serialized[0] = AccountTransactionType.EncryptedTransfer;
    put(serialized, 1, data);
    put(serialized, 1 + data.length, proof);
    return Buffer.from(serialized);
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
        Buffer.from(Uint8Array.of(AccountTransactionType.AddBaker)),
        serializeBakerVerifyKeys(payload),
        serializeAddBakerProofsStakeRestake(payload),
    ]);
}

export function serializeUpdateBakerKeys(payload: UpdateBakerKeysPayload) {
    return Buffer.concat([
        Buffer.from(Uint8Array.of(AccountTransactionType.UpdateBakerKeys)),
        serializeBakerVerifyKeys(payload),
        serializeBakerKeyProofs(payload),
    ]);
}

export function serializeRemoveBaker() {
    return Buffer.from(Uint8Array.of(AccountTransactionType.RemoveBaker));
}

export function serializeUpdateBakerStake(payload: UpdateBakerStakePayload) {
    return Buffer.concat([
        Buffer.from(Uint8Array.of(AccountTransactionType.UpdateBakerStake)),
        encodeWord64(BigInt(payload.stake)),
    ]);
}

export function serializeUpdateBakerRestakeEarnings(
    payload: UpdateBakerRestakeEarningsPayload
) {
    return Buffer.concat([
        Buffer.from(
            Uint8Array.of(AccountTransactionType.UpdateBakerRestakeEarnings)
        ),
        serializeBoolean(payload.restakeEarnings),
    ]);
}

export function serializeTransferPayload(
    kind: AccountTransactionType,
    payload: TransactionPayload
): Buffer {
    switch (kind) {
        case AccountTransactionType.SimpleTransfer:
            return serializeSimpleTransfer(payload as SimpleTransferPayload);
        case AccountTransactionType.UpdateCredentials:
            return serializeUpdateCredentials(
                payload as UpdateAccountCredentialsPayload
            );
        case AccountTransactionType.TransferWithSchedule:
            return serializeTransferWithSchedule(
                payload as ScheduledTransferPayload
            );
        case AccountTransactionType.TransferToEncrypted:
            return serializeTransferToEncypted(
                payload as TransferToEncryptedPayload
            );
        case AccountTransactionType.TransferToPublic:
            return serializeTransferToPublic(
                payload as TransferToPublicPayload
            );
        case AccountTransactionType.EncryptedTransfer:
            return serializeEncryptedTransfer(
                payload as EncryptedTransferPayload
            );
        case AccountTransactionType.AddBaker:
            return serializeAddBaker(payload as AddBakerPayload);
        case AccountTransactionType.UpdateBakerKeys:
            return serializeUpdateBakerKeys(payload as UpdateBakerKeysPayload);

        case AccountTransactionType.RemoveBaker:
            return serializeRemoveBaker();
        case AccountTransactionType.UpdateBakerStake:
            return serializeUpdateBakerStake(
                payload as UpdateBakerStakePayload
            );
        case AccountTransactionType.UpdateBakerRestakeEarnings:
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
