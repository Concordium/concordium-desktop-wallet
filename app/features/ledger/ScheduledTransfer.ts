import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import {
    Schedule,
    ScheduledTransfer,
    ScheduledTransferWithMemo,
} from '~/utils/types';
import {
    serializeScheduledTransferPayloadBase,
    serializeSchedulePoint,
    serializeTransactionHeader,
    serializeTransferPayload,
} from '~/utils/transactionSerialization';
import pathAsBuffer from './Path';
import { chunkArray } from '~/utils/basicHelpers';
import { encodeWord16 } from '~/utils/serializationHelpers';
import { encodeAsCBOR } from '~/utils/cborHelper';
import sendMemo from './Memo';

const INS_TRANSFER_WITH_SCHEDULE = 0x03;
const INS_TRANSFER_WITH_SCHEDULE_AND_MEMO = 0x34;

const p2 = 0x00;

function getSerializedHeaderKindAndPayloadBase(
    path: number[],
    transaction: ScheduledTransfer | ScheduledTransferWithMemo
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

    const payloadBase = serializeScheduledTransferPayloadBase(
        transaction.payload,
        transaction.transactionKind
    );

    return Buffer.concat([pathAsBuffer(path), header, payloadBase]);
}

async function sendSchedule(
    transport: Transport,
    ins: number,
    schedule: Schedule
) {
    const p1 = 0x01;
    let response;
    const chunks = chunkArray(schedule.map(serializeSchedulePoint), 15); // 15 is the maximum amount we can fit
    for (const chunk of chunks) {
        response = await transport.send(
            0xe0,
            ins,
            p1,
            p2,
            Buffer.concat(chunk)
        );
    }

    if (!response) {
        throw new Error('Unexpected missing response from ledger;');
    }
    return response.slice(0, 64);
}

export async function signTransferWithSchedule(
    transport: Transport,
    path: number[],
    transaction: ScheduledTransfer
): Promise<Buffer> {
    const ins = INS_TRANSFER_WITH_SCHEDULE;

    const p1 = 0x00;

    await transport.send(
        0xe0,
        ins,
        p1,
        p2,
        getSerializedHeaderKindAndPayloadBase(path, transaction)
    );

    return sendSchedule(transport, ins, transaction.payload.schedule);
}

export async function signTransferWithScheduleAndMemo(
    transport: Transport,
    path: number[],
    transaction: ScheduledTransferWithMemo
): Promise<Buffer> {
    const ins = INS_TRANSFER_WITH_SCHEDULE_AND_MEMO;

    let p1 = 0x02;

    const { memo } = transaction.payload;
    const data = Buffer.concat([
        getSerializedHeaderKindAndPayloadBase(path, transaction),
        encodeWord16(encodeAsCBOR(memo).length),
    ]);

    await transport.send(0xe0, ins, p1, p2, data);

    p1 = 0x03;
    await sendMemo(transport, ins, p1, p2, transaction.payload.memo);

    return sendSchedule(transport, ins, transaction.payload.schedule);
}
