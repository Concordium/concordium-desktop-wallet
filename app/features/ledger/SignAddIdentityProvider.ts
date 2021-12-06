/* eslint-disable no-await-in-loop */
import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { AddIdentityProvider, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { serializeIpInfo, encodeWord32 } from '~/utils/serializationHelpers';
import { chunkBuffer } from '~/utils/basicHelpers';
import sendDescription from './Description';

const INS_ADD_IDENTITY_PROVIDER = 0x2d;

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
    const serializedIpInfo = serializeIpInfo(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x00;

    // Send initial packet of data
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        encodeWord32(serializedIpInfo.length),
        encodeWord32(transaction.payload.ipIdentity),
    ]);
    await transport.send(0xe0, INS_ADD_IDENTITY_PROVIDER, p1, p2, initialData);

    p1 = 0x01;
    await sendDescription(
        transport,
        INS_ADD_IDENTITY_PROVIDER,
        p1,
        p2,
        transaction.payload.ipDescription
    );

    // Send verifyKey, by streaming the verifyKey bytes (maximum of 255 bytes per packet)
    p1 = 0x03;
    const verifyKey = Buffer.from(transaction.payload.ipVerifyKey, 'hex');
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
    p1 = 0x04;
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
