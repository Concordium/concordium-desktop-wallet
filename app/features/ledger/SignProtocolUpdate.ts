import type Transport from '@ledgerhq/hw-transport';
import { ProtocolUpdate, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeProtocolUpdate,
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';

const INS_PROTOCOL_UPDATE = 0x21;

function toChunks(array: Uint8Array, chunkSize: number) {
    const R = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        R.push(array.slice(i, i + chunkSize));
    }
    return R;
}

export default async function signUpdateTransaction(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<ProtocolUpdate>,
    serializedPayload: Buffer
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };
    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);
    const serializedProtocolUpdate = serializeProtocolUpdate(
        transaction.payload
    );

    let p1 = 0x00;
    const p2 = 0x00;

    // Send initial packet of data
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        serializedProtocolUpdate.payloadLength,
    ]);
    await transport.send(0xe0, INS_PROTOCOL_UPDATE, p1, p2, initialData);

    // Send message length.
    p1 = 0x01;
    const messageLengthData = serializedProtocolUpdate.message.length;
    await transport.send(0xe0, INS_PROTOCOL_UPDATE, p1, p2, messageLengthData);

    // Stream the message bytes (maximum of 255 bytes per packet)
    p1 = 0x02;
    const chunks = toChunks(serializedProtocolUpdate.message.message, 255);
    chunks.forEach(async (chunk) => {
        await transport.send(
            0xe0,
            INS_PROTOCOL_UPDATE,
            p1,
            p2,
            Buffer.from(chunk)
        );
    });

    const signature = Buffer.alloc(0);
    return signature;
}
