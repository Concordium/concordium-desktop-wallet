/* eslint-disable no-await-in-loop */
import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import {
    AddAnonymityRevoker,
    UpdateInstruction,
    SerializedDescription,
} from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { chunkBuffer } from '../../utils/basicHelpers';
import {
    getSerializedDescription,
    encodeWord32,
    serializeArInfo,
} from '~/utils/serializationHelpers';

const INS_ADD_ANONYMITY_REVOKER = 0x2c;

export default async function signAddIdentityProviderTransaction(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<AddAnonymityRevoker>,
    serializedPayload: Buffer
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);
    const serializedDescription = getSerializedDescription(
        transaction.payload.arDescription
    );
    const serializedArInfo = serializeArInfo(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x00;

    // Send initial packet of data
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        encodeWord32(serializedArInfo.length),
        encodeWord32(transaction.payload.arIdentity),
    ]);
    await transport.send(0xe0, INS_ADD_ANONYMITY_REVOKER, p1, p2, initialData);

    for (const text of ['name', 'url', 'description']) {
        // Send description
        p1 = 0x01;
        const descriptionLengthData =
            serializedDescription[text as keyof SerializedDescription].length;
        await transport.send(
            0xe0,
            INS_ADD_ANONYMITY_REVOKER,
            p1,
            p2,
            descriptionLengthData
        );

        // Stream the description bytes (maximum of 255 bytes per packet)
        p1 = 0x02;
        const descriptionChunks = chunkBuffer(
            serializedDescription[text as keyof SerializedDescription].data,
            255
        );
        for (const chunk of descriptionChunks) {
            await transport.send(
                0xe0,
                INS_ADD_ANONYMITY_REVOKER,
                p1,
                p2,
                Buffer.from(chunk)
            );
        }
    }

    // Send public Key
    p1 = 0x03;
    const publicKey = Buffer.from(transaction.payload.arPublicKey, 'hex');

    const result = await transport.send(
        0xe0,
        INS_ADD_ANONYMITY_REVOKER,
        p1,
        p2,
        publicKey
    );

    return result.slice(0, 64);
}
