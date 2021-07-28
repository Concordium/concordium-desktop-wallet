/* eslint-disable no-await-in-loop */
import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { AddIdentityProvider, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
    serializeDescription,
} from '../../utils/UpdateSerialization';
import { chunkBuffer } from '../../utils/basicHelpers';
import { encodeWord32, encodeWord64 } from '~/utils/serializationHelpers';

const INS_ADD_IDENTITY_PROVIDER = 0x21;

export default async function signAddIdentityProviderTransaction(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<AddIdentityProvider>,
    serializedPayload: Buffer
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);
    const serializedDescription = serializeDescription(
        transaction.payload.ipDescription
    );

    let p1 = 0x00;
    const p2 = 0x00;

    // Send initial packet of data
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        encodeWord32(transaction.payload.ipIdentity),
    ]);
    await transport.send(0xe0, INS_ADD_IDENTITY_PROVIDER, p1, p2, initialData);

    // Send description
    p1 = 0x01;
    const descriptionLengthData = encodeWord64(
        BigInt(serializedDescription.length)
    );
    await transport.send(
        0xe0,
        INS_ADD_IDENTITY_PROVIDER,
        p1,
        p2,
        descriptionLengthData
    );

    // Stream the description bytes (maximum of 255 bytes per packet)
    p1 = 0x02;
    const descriptionChunks = chunkBuffer(serializedDescription, 255);
    for (const chunk of descriptionChunks) {
        await transport.send(
            0xe0,
            INS_ADD_IDENTITY_PROVIDER,
            p1,
            p2,
            Buffer.from(chunk)
        );
    }

    // Send verifyKey
    p1 = 0x03;
    const verifyKey = Buffer.from(transaction.payload.ipVerifyKey, 'hex');
    const verifyKeyLengthData = encodeWord64(BigInt(verifyKey.length));
    await transport.send(
        0xe0,
        INS_ADD_IDENTITY_PROVIDER,
        p1,
        p2,
        verifyKeyLengthData
    );

    // Stream the description bytes (maximum of 255 bytes per packet)
    p1 = 0x04;
    const verifyKeyChunks = chunkBuffer(verifyKey, 255);
    for (const chunk of verifyKeyChunks) {
        await transport.send(
            0xe0,
            INS_ADD_IDENTITY_PROVIDER,
            p1,
            p2,
            Buffer.from(chunk)
        );
    }

    // Send cdiVerifyKey
    p1 = 0x05;
    const cdiVerifyKey = Buffer.from(transaction.payload.ipCdiVerifyKey, 'hex');

    const result = await transport.send(
        0xe0,
        INS_ADD_IDENTITY_PROVIDER,
        p1,
        p2,
        cdiVerifyKey
    );

    return result.slice(0, 64);
}
