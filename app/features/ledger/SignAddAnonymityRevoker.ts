/* eslint-disable no-await-in-loop */
import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { AddAnonymityRevoker, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { encodeWord32, serializeArInfo } from '~/utils/serializationHelpers';
import sendDescription from './Description';

const INS_ADD_ANONYMITY_REVOKER = 0x2c;

export default async function signAddAnonymityRevokerTransaction(
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

    p1 = 0x01;
    await sendDescription(
        transport,
        INS_ADD_ANONYMITY_REVOKER,
        p1,
        p2,
        transaction.payload.arDescription
    );

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
