import type Transport from '@ledgerhq/hw-transport';
import {
    AccountTransaction,
    TransactionKindId,
    SimpleTransfer,
    ScheduledTransfer,
    TransferToEncrypted,
    EncryptedTransfer,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
    instanceOfTransferToEncrypted,
    TransferToPublic,
    instanceOfTransferToPublic,
    instanceOfEncryptedTransfer,
} from '~/utils/types';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
    serializeSchedulePoint,
    serializeScheduledTransferPayloadBase,
    serializeTransferToPublicData,
} from '~/utils/transactionSerialization';
import pathAsBuffer from './Path';
import {
    encodeWord16,
    encodeWord64,
    base58ToBuffer,
} from '../../utils/serializationHelpers';
import { chunkBuffer, chunkArray } from '~/utils/basicHelpers';

const INS_SIMPLE_TRANSFER = 0x02;
const INS_TRANSFER_TO_ENCRYPTED = 0x11;
const INS_TRANSFER_TO_PUBLIC = 0x12;
const INS_TRANSFER_WITH_SCHEDULE = 0x03;
const INS_ENCRYPTED_TRANSFER = 0x10;

async function signSimpleTransfer(
    transport: Transport,
    path: number[],
    transaction: SimpleTransfer
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        TransactionKindId.Simple_transfer,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_SIMPLE_TRANSFER,
        p1,
        p2,
        data
    );
    const signature = response.slice(0, 64);
    return signature;
}

async function signTransferToEncrypted(
    transport: Transport,
    path: number[],
    transaction: TransferToEncrypted
) {
    const payload = serializeTransferPayload(
        TransactionKindId.Transfer_to_encrypted,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_TRANSFER_TO_ENCRYPTED,
        p1,
        p2,
        data
    );
    const signature = response.slice(0, 64);
    return signature;
}

async function signTransferToPublic(
    transport: Transport,
    path: number[],
    transaction: TransferToPublic
) {
    if (!transaction.payload.proof) {
        throw new Error('Unexpected missing proof');
    }

    const payload = serializeTransferPayload(
        TransactionKindId.Transfer_to_public,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const kind = Buffer.alloc(1);
    kind.writeInt8(TransactionKindId.Transfer_to_public, 0);

    const data = Buffer.concat([pathAsBuffer(path), header, kind]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_TRANSFER_TO_PUBLIC, p1, p2, data);

    p1 = 0x01;
    const proof: Buffer = Buffer.from(transaction.payload.proof, 'hex');

    await transport.send(
        0xe0,
        INS_TRANSFER_TO_PUBLIC,
        p1,
        p2,
        Buffer.concat([
            Buffer.from(serializeTransferToPublicData(transaction.payload)),
            encodeWord16(proof.length),
        ])
    );

    p1 = 0x02;

    let response;
    const chunks = chunkBuffer(proof, 255);
    for (let i = 0; i < chunks.length; i += 1) {
        // eslint-disable-next-line  no-await-in-loop
        response = await transport.send(
            0xe0,
            INS_TRANSFER_TO_PUBLIC,
            p1,
            p2,
            Buffer.from(chunks[i])
        );
    }
    if (!response) {
        throw new Error('Unexpected missing response from ledger;');
    }
    const signature = response.slice(0, 64);
    return signature;
}

async function signEncryptedTransfer(
    transport: Transport,
    path: number[],
    transaction: EncryptedTransfer
) {
    if (!transaction.payload.proof) {
        throw new Error('Unexpected missing proof');
    }
    if (!transaction.payload.remainingEncryptedAmount) {
        throw new Error('Unexpected missing payload data');
    }

    const payload = serializeTransferPayload(
        TransactionKindId.Encrypted_transfer,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const kind = Buffer.alloc(1);
    kind.writeInt8(TransactionKindId.Encrypted_transfer, 0);

    const data = Buffer.concat([
        pathAsBuffer(path),
        header,
        kind,
        base58ToBuffer(transaction.payload.toAddress),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_ENCRYPTED_TRANSFER, p1, p2, data);

    p1 = 0x01;
    await transport.send(
        0xe0,
        INS_ENCRYPTED_TRANSFER,
        p1,
        p2,
        Buffer.concat([
            Buffer.from(transaction.payload.remainingEncryptedAmount, 'hex'),
        ])
    );

    p1 = 0x02;
    const proof = Buffer.from(transaction.payload.proof, 'hex');

    await transport.send(
        0xe0,
        INS_ENCRYPTED_TRANSFER,
        p1,
        p2,
        Buffer.concat([
            Buffer.from(transaction.payload.transferAmount, 'hex'),
            encodeWord64(BigInt(transaction.payload.index)),
            encodeWord16(proof.length),
        ])
    );

    p1 = 0x03;

    let response;
    const chunks = chunkBuffer(proof, 255);
    for (let i = 0; i < chunks.length; i += 1) {
        // eslint-disable-next-line  no-await-in-loop
        response = await transport.send(
            0xe0,
            INS_ENCRYPTED_TRANSFER,
            p1,
            p2,
            Buffer.from(chunks[i])
        );
    }
    if (!response) {
        throw new Error('Unexpected missing response from ledger;');
    }
    const signature = response.slice(0, 64);
    return signature;
}

async function signTransferWithSchedule(
    transport: Transport,
    path: number[],
    transaction: ScheduledTransfer
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        TransactionKindId.Transfer_with_schedule,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = Buffer.concat([
        pathAsBuffer(path),
        header,
        serializeScheduledTransferPayloadBase(transaction.payload),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_TRANSFER_WITH_SCHEDULE, p1, p2, data);

    const { schedule } = transaction.payload;

    p1 = 0x01;

    let response;
    const chunks = chunkArray(schedule.map(serializeSchedulePoint), 15); // 15 is the maximum amount we can fit
    for (let i = 0; i < chunks.length; i += 1) {
        // eslint-disable-next-line  no-await-in-loop
        response = await transport.send(
            0xe0,
            INS_TRANSFER_WITH_SCHEDULE,
            p1,
            p2,
            Buffer.concat(chunks[i])
        );
    }

    if (!response) {
        throw new Error('Unexpected missing response from ledger;');
    }

    const signature = response.slice(0, 64);
    return signature;
}

export default async function signTransfer(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    if (instanceOfSimpleTransfer(transaction)) {
        return signSimpleTransfer(transport, path, transaction);
    }
    if (instanceOfScheduledTransfer(transaction)) {
        return signTransferWithSchedule(transport, path, transaction);
    }
    if (instanceOfTransferToEncrypted(transaction)) {
        return signTransferToEncrypted(transport, path, transaction);
    }
    if (instanceOfTransferToPublic(transaction)) {
        return signTransferToPublic(transport, path, transaction);
    }
    if (instanceOfEncryptedTransfer(transaction)) {
        return signEncryptedTransfer(transport, path, transaction);
    }
    throw new Error(
        `The received transaction was not a supported transaction type`
    );
}
