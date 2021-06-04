/* eslint-disable no-await-in-loop */
import { Transport } from './Transport';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    UpdateInstruction,
} from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { serializeVerifyKey } from '~/utils/serializationHelpers';
import { chunkArray } from '~/utils/basicHelpers';

/**
 * Handles the serialization and sending of an access structure to the hardware
 * device.
 */
async function sendAccessStructure(
    accessStructure: AccessStructure,
    transport: Transport,
    INS: number
): Promise<Buffer> {
    const serializedAccessStructureSize = Buffer.alloc(2);
    serializedAccessStructureSize.writeUInt16BE(
        accessStructure.publicKeyIndicies.length,
        0
    );

    let p1 = 0x02;
    const p2 = 0x00;
    await transport.send(0xe0, INS, p1, p2, serializedAccessStructureSize);

    p1 = 0x03;
    // Chunk into section of at most 127, so that we will send no more than 2 * 127 = 254
    // bytes at the same time, to stay within the maximum that the Ledger supports.
    const chunkedIndicies = chunkArray(accessStructure.publicKeyIndicies, 127);
    for (const indices of chunkedIndicies) {
        const serializedIndicies = Buffer.concat(
            indices.map((index) => {
                const serializedIndex = Buffer.alloc(2);
                serializedIndex.writeUInt16BE(index.index, 0);
                return serializedIndex;
            })
        );
        await transport.send(0xe0, INS, p1, p2, serializedIndicies);
    }

    p1 = 0x04;
    const serializedThreshold = Buffer.alloc(2);
    serializedThreshold.writeUInt16BE(accessStructure.threshold, 0);
    return transport.send(0xe0, INS, p1, p2, serializedThreshold);
}

export default async function signAuthorizationKeysUpdate(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<AuthorizationKeysUpdate>,
    serializedPayload: Buffer,
    INS: number
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);

    let p1 = 0x00;
    const p2 = 0x00;

    const serializedKeyUpdateType = Buffer.alloc(1);
    serializedKeyUpdateType.writeInt8(transaction.payload.keyUpdateType, 0);

    const updateKeysLength = transaction.payload.keys.length;
    const serializedNumberOfUpdateKeys = Buffer.alloc(2);
    serializedNumberOfUpdateKeys.writeUInt16BE(updateKeysLength, 0);

    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        serializedKeyUpdateType,
        serializedNumberOfUpdateKeys,
    ]);
    await transport.send(0xe0, INS, p1, p2, initialData);

    p1 = 0x01;
    for (let i = 0; i < updateKeysLength; i += 1) {
        const verificationKey = transaction.payload.keys[i];
        const data = serializeVerifyKey(verificationKey);
        await transport.send(0xe0, INS, p1, p2, data);
    }

    const authorizationKeysUpdate: AuthorizationKeysUpdate =
        transaction.payload;

    let response;
    for (const accessStructure of authorizationKeysUpdate.accessStructures) {
        response = await sendAccessStructure(accessStructure, transport, INS);
    }

    if (!response) {
        throw new Error('The signature was not returned correctly.');
    }

    return response.slice(0, 64);
}
