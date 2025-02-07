import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import {
    base58ToBuffer,
    putInt8,
    encodeWord16,
    encodeWord64,
} from '~/utils/serializationHelpers';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
} from '~/utils/transactionSerialization';
import {
    EncryptedTransfer,
    EncryptedTransferPayload,
    EncryptedTransferWithMemo,
    EncryptedTransferWithMemoPayload,
} from '~/utils/types';
import { encodeAsCBOR } from '~/utils/cborHelper';
import { chunkBuffer } from '~/utils/basicHelpers';
import sendMemo from './Memo';
import pathAsBuffer from './Path';

const INS_ENCRYPTED_TRANSFER = 0x10;
const INS_ENCRYPTED_TRANSFER_WITH_MEMO = 0x33;
const p2 = 0x00;

function getSerializedHeaderKindAndSender(
    path: number[],
    transaction: EncryptedTransfer | EncryptedTransferWithMemo
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

    const kind = putInt8(transaction.transactionKind);
    const sender = base58ToBuffer(transaction.payload.toAddress);
    return Buffer.concat([pathAsBuffer(path), header, kind, sender]);
}

function sendRemainingAmount(
    transport: Transport,
    ins: number,
    payload: EncryptedTransferPayload | EncryptedTransferWithMemoPayload
) {
    const p1 = 0x01;

    if (!payload.remainingEncryptedAmount) {
        throw new Error('Unexpected missing payload data');
    }

    return transport.send(
        0xe0,
        ins,
        p1,
        p2,
        Buffer.concat([Buffer.from(payload.remainingEncryptedAmount, 'hex')])
    );
}

function sendTransferAmountAggIndexProofSize(
    transport: Transport,
    ins: number,
    payload: EncryptedTransferPayload | EncryptedTransferWithMemoPayload
) {
    const p1 = 0x02;
    if (!payload.proof) {
        throw new Error('Unexpected missing proof');
    }

    if (!payload.transferAmount || !payload.index) {
        throw new Error('Unexpected missing payload data');
    }

    const proof = Buffer.from(payload.proof, 'hex');

    return transport.send(
        0xe0,
        ins,
        p1,
        p2,
        Buffer.concat([
            Buffer.from(payload.transferAmount, 'hex'),
            encodeWord64(BigInt(payload.index)),
            encodeWord16(proof.length),
        ])
    );
}

async function sendProof(
    transport: Transport,
    ins: number,
    payload: EncryptedTransferPayload | EncryptedTransferWithMemoPayload
) {
    const p1 = 0x03;

    if (!payload.proof) {
        throw new Error('Unexpected missing proof');
    }

    const proof = Buffer.from(payload.proof, 'hex');

    let response;
    const chunks = chunkBuffer(proof, 255);
    for (let i = 0; i < chunks.length; i += 1) {
        response = await transport.send(
            0xe0,
            ins,
            p1,
            p2,
            Buffer.from(chunks[i])
        );
    }

    if (!response) {
        throw new Error('Unexpected missing response from ledger;');
    }
    return response.slice(0, 64);
}

export async function signEncryptedTransfer(
    transport: Transport,
    path: number[],
    transaction: EncryptedTransfer
) {
    const ins = INS_ENCRYPTED_TRANSFER;

    const data = getSerializedHeaderKindAndSender(path, transaction);

    const p1 = 0x00;
    await transport.send(0xe0, ins, p1, p2, data);

    await sendRemainingAmount(transport, ins, transaction.payload);
    await sendTransferAmountAggIndexProofSize(
        transport,
        ins,
        transaction.payload
    );
    return sendProof(transport, ins, transaction.payload);
}

export async function signEncryptedTransferWithMemo(
    transport: Transport,
    path: number[],
    transaction: EncryptedTransferWithMemo
) {
    const ins = INS_ENCRYPTED_TRANSFER_WITH_MEMO;
    const { memo } = transaction.payload;
    const memoLength = memo ? encodeAsCBOR(memo).length : 0;

    const data = Buffer.concat([
        getSerializedHeaderKindAndSender(path, transaction),
        encodeWord16(memoLength),
    ]);
    let p1 = 0x04;
    await transport.send(0xe0, ins, p1, p2, data);

    p1 = 0x05;

    await sendMemo(transport, ins, p1, p2, transaction.payload.memo);

    await sendRemainingAmount(transport, ins, transaction.payload);
    await sendTransferAmountAggIndexProofSize(
        transport,
        ins,
        transaction.payload
    );
    return sendProof(transport, ins, transaction.payload);
}
