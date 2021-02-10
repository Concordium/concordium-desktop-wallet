import { putBase58Check } from './serializationHelpers';
import {
    BlockItemKind,
    ExchangeRate,
    FoundationAccount,
    TransactionFeeDistribution,
    UpdateHeader,
    UpdateInstruction,
    UpdateInstructionPayload,
} from './types';

/**
 * Serializes an ExchangeRate to bytes.
 */
export function serializeExchangeRate(exchangeRate: ExchangeRate) {
    const serializedExchangeRate = Buffer.alloc(16);
    serializedExchangeRate.writeBigUInt64BE(BigInt(exchangeRate.numerator), 0);
    serializedExchangeRate.writeBigUInt64BE(
        BigInt(exchangeRate.denominator),
        8
    );
    return serializedExchangeRate;
}

/**
 * Serializes a TransactionFeeDistribution to bytes.
 */
export function serializeTransactionFeeDistribution(
    transactionFeeDistribution: TransactionFeeDistribution
) {
    const serializedTransactionFeeDistribution = Buffer.alloc(8);
    serializedTransactionFeeDistribution.writeUInt32BE(
        transactionFeeDistribution.baker,
        0
    );
    serializedTransactionFeeDistribution.writeUInt32BE(
        transactionFeeDistribution.gasAccount,
        4
    );
    return serializedTransactionFeeDistribution;
}

/**
 * Serializes a FoundationAccount to bytes.
 */
export function serializeFoundationAccount(
    foundationAccount: FoundationAccount
) {
    const serializedFoundationAccount = Buffer.alloc(32);
    putBase58Check(serializedFoundationAccount, 0, foundationAccount.address);
    return serializedFoundationAccount;
}

/**
 * Serializes an UpdateHeader to exactly 28 bytes. See the interface
 * UpdateHeader for comments regarding the byte allocation for each field.
 */
function serializeUpdateHeader(updateHeader: UpdateHeader): Buffer {
    const serializedUpdateHeader = Buffer.alloc(28);
    serializedUpdateHeader.writeBigUInt64BE(
        BigInt(updateHeader.sequenceNumber),
        0
    );
    serializedUpdateHeader.writeBigUInt64BE(
        BigInt(updateHeader.effectiveTime),
        8
    );
    serializedUpdateHeader.writeBigUInt64BE(BigInt(updateHeader.timeout), 16);
    if (!updateHeader.payloadSize) {
        throw new Error('Unexpected missing payloadSize');
    }
    serializedUpdateHeader.writeInt32BE(updateHeader.payloadSize, 24);
    return serializedUpdateHeader;
}

/**
 * Serializes a list of signatures to the format expected by the chain. The serialization
 * is given by:
 *
 *  - [signatureListLength (keyIndex signatureLength signatureBytes) * signatureListLength]
 *
 * The signatureListLength, keyIndex and signatureLength are all serialized as Word16.
 * @param signatures list of signatures as bytes
 */
function serializeUpdateSignatures(signatures: Buffer[]): Buffer {
    const signatureCount = Buffer.alloc(2);
    signatureCount.writeInt16BE(signatures.length, 0);

    const prefixedSignatures = signatures.reduce((result, signature, index) => {
        const signaturePrefix = Buffer.alloc(2 + 2);
        signaturePrefix.writeInt16BE(index, 0);
        signaturePrefix.writeInt16BE(signature.length, 2);
        return Buffer.concat([result, signaturePrefix, signature]);
    }, Buffer.alloc(0));

    return Buffer.concat([signatureCount, prefixedSignatures]);
}

/**
 * Serializes an UpdateInstruction into its byte representation that is to be
 * signed. Note that this excludes the signatures that are part of the serialization
 * that is sent to the chain.
 */
export function serializeUpdateInstructionHeaderAndPayload(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    serializedPayload: Buffer
) {
    const updateHeaderWithPayloadSize = {
        ...updateInstruction.header,
        payloadSize: serializedPayload.length + 1,
    };
    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);

    const serializedUpdateType = Buffer.alloc(1);
    serializedUpdateType.writeInt8(updateInstruction.type, 0);

    return Buffer.concat([
        serializedHeader,
        serializedUpdateType,
        serializedPayload,
    ]);
}

/**
 * Serializes an update instruction, including serialization of the signatures. This is
 * the serialization that the chain expects, and the hash of this serialization is the
 * transaction hash that can be used to look up a submitted transaction. Note that a
 * node does not accept this serialization directly, as it expects transactions to be
 * wrapped in a versioning wrapper.
 * @param updateInstruction the transaction to serialize
 */
export function serializeUpdateInstruction(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    serializedPayload: Buffer
) {
    const serializedHeaderAndPayload = serializeUpdateInstructionHeaderAndPayload(
        updateInstruction,
        serializedPayload
    );

    const signaturesAsBytes = updateInstruction.signatures.map((signature) =>
        Buffer.from(signature, 'hex')
    );
    const serializedSignatures = serializeUpdateSignatures(signaturesAsBytes);

    const blockItemKind = Buffer.alloc(1);
    blockItemKind.writeInt8(BlockItemKind.UpdateInstructionKind, 0);

    return Buffer.concat([
        blockItemKind,
        serializedHeaderAndPayload,
        serializedSignatures,
    ]);
}

/**
 * Serialize an update instruction, including serialization of the signatures, so that
 * it can be submitted to a node. The serialization update instruction is is pre-fixed
 * with a version (currently hardcoded as 0), as that is required by the node.
 * @param updateInstruction the transaction to serialize
 */
export function serializeForSubmission(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    serializedPayload: Buffer
) {
    // Currently versioning is hardcoded to 0. This value might be changed if
    // the interface is updated at some point.
    const version = Buffer.alloc(1);
    version.writeInt8(0, 0);

    const serializedTransaction = serializeUpdateInstruction(
        updateInstruction,
        serializedPayload
    );
    return Buffer.concat([version, serializedTransaction]);
}
