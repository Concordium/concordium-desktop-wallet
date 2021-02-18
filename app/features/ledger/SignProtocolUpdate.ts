/* eslint-disable no-await-in-loop */
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

export default async function signUpdateProtocolTransaction(
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
    const messageChunks = toChunks(
        serializedProtocolUpdate.message.message,
        255
    );
    for (let i = 0; i < messageChunks.length; i += 1) {
        await transport.send(
            0xe0,
            INS_PROTOCOL_UPDATE,
            p1,
            p2,
            Buffer.from(messageChunks[i])
        );
    }

    // Send specification URL length.
    p1 = 0x01;
    const specificationUrlLengthData =
        serializedProtocolUpdate.specificationUrl.length;
    await transport.send(
        0xe0,
        INS_PROTOCOL_UPDATE,
        p1,
        p2,
        specificationUrlLengthData
    );

    // Stream the specification URL bytes (maximum of 255 bytes per packet)
    p1 = 0x02;
    const urlChunks = toChunks(
        serializedProtocolUpdate.specificationUrl.message,
        255
    );
    for (let i = 0; i < urlChunks.length; i += 1) {
        await transport.send(
            0xe0,
            INS_PROTOCOL_UPDATE,
            p1,
            p2,
            Buffer.from(urlChunks[i])
        );
    }

    // Send the transaction hash.
    p1 = 0x03;
    await transport.send(
        0xe0,
        INS_PROTOCOL_UPDATE,
        p1,
        p2,
        serializedProtocolUpdate.transactionHash
    );

    // Send auxiliary data in 255 byte chunks.
    p1 = 0x04;
    const auxiliaryDataChunks = toChunks(
        serializedProtocolUpdate.auxiliaryData,
        255
    );
    for (let j = 0; j < auxiliaryDataChunks.length; j += 1) {
        const result = await transport.send(
            0xe0,
            INS_PROTOCOL_UPDATE,
            p1,
            p2,
            Buffer.from(auxiliaryDataChunks[j])
        );

        if (j === auxiliaryDataChunks.length - 1) {
            return result.slice(0, 64);
        }
    }

    throw new Error(
        'A signature was not returned by the Ledger device. This can only happen due to an implementation error.'
    );
}
