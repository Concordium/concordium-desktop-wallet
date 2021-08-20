import { Buffer } from 'buffer/';
import { AccountTransactionType } from '@concordium/node-sdk/lib/src/types';
import { Transport } from './Transport';
import {
    AccountTransaction,
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
    instanceOfAddBaker,
    AddBaker,
    instanceOfRemoveBaker,
    RemoveBaker,
    instanceOfUpdateBakerKeys,
    UpdateBakerKeys,
    UpdateBakerStake,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerRestakeEarnings,
    UpdateBakerRestakeEarnings,
} from '~/utils/types';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
    serializeSchedulePoint,
    serializeScheduledTransferPayloadBase,
    serializeTransferToPublicData,
    serializeAddBaker,
    serializeBakerVerifyKeys,
    serializeAddBakerProofsStakeRestake,
    serializeRemoveBaker,
    serializeUpdateBakerKeys,
    serializeBakerKeyProofs,
    serializeUpdateBakerStake,
    serializeUpdateBakerRestakeEarnings,
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
const INS_ADD_OR_UPDATE_BAKER = 0x13;
const INS_REMOVE_BAKER = 0x14;
const INS_UPDATE_BAKER_STAKE = 0x15;
const INS_UPDATE_BAKER_RESTAKE_EARNINGS = 0x16;

async function signSimpleTransfer(
    transport: Transport,
    path: number[],
    transaction: SimpleTransfer
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        AccountTransactionType.SimpleTransfer,
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
        AccountTransactionType.TransferToEncrypted,
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
        AccountTransactionType.TransferToPublic,
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
    kind.writeInt8(AccountTransactionType.TransferToPublic, 0);

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
    if (
        !transaction.payload.remainingEncryptedAmount ||
        !transaction.payload.transferAmount
    ) {
        throw new Error('Unexpected missing payload data');
    }

    const payload = serializeTransferPayload(
        AccountTransactionType.EncryptedTransfer,
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
    kind.writeInt8(AccountTransactionType.EncryptedTransfer, 0);

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
        AccountTransactionType.TransferWithSchedule,
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

async function signAddBaker(
    transport: Transport,
    path: number[],
    transaction: AddBaker
): Promise<Buffer> {
    const payload = serializeAddBaker(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const part1 = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.AddBaker)),
    ]);

    const part2 = serializeBakerVerifyKeys(transaction.payload);
    const part3 = serializeAddBakerProofsStakeRestake(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part1);
    p1 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part2);
    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_ADD_OR_UPDATE_BAKER,
        p1,
        p2,
        part3
    );

    return response.slice(0, 64);
}

async function signUpdateBakerKeys(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerKeys
): Promise<Buffer> {
    const payload = serializeUpdateBakerKeys(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const part1 = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.UpdateBakerKeys)),
    ]);

    const part2 = serializeBakerVerifyKeys(transaction.payload);
    const part3 = serializeBakerKeyProofs(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part1);
    p1 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part2);
    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_ADD_OR_UPDATE_BAKER,
        p1,
        p2,
        part3
    );

    return response.slice(0, 64);
}

async function signRemoveBaker(
    transport: Transport,
    path: number[],
    transaction: RemoveBaker
): Promise<Buffer> {
    const payload = serializeRemoveBaker();

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.RemoveBaker)),
    ]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_REMOVE_BAKER,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

async function signUpdateBakerStake(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerStake
): Promise<Buffer> {
    const payload = serializeUpdateBakerStake(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_UPDATE_BAKER_STAKE,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

async function signUpdateBakerRestakeEarnings(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerRestakeEarnings
): Promise<Buffer> {
    const payload = serializeUpdateBakerRestakeEarnings(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_UPDATE_BAKER_RESTAKE_EARNINGS,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
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
    if (instanceOfAddBaker(transaction)) {
        return signAddBaker(transport, path, transaction);
    }
    if (instanceOfUpdateBakerKeys(transaction)) {
        return signUpdateBakerKeys(transport, path, transaction);
    }
    if (instanceOfRemoveBaker(transaction)) {
        return signRemoveBaker(transport, path, transaction);
    }
    if (instanceOfUpdateBakerStake(transaction)) {
        return signUpdateBakerStake(transport, path, transaction);
    }
    if (instanceOfUpdateBakerRestakeEarnings(transaction)) {
        return signUpdateBakerRestakeEarnings(transport, path, transaction);
    }
    throw new Error(
        `The received transaction was not a supported transaction type`
    );
}
