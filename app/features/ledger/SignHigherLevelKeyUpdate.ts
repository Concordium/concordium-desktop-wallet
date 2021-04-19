/* eslint-disable no-await-in-loop */
import type Transport from '@ledgerhq/hw-transport';
import { HigherLevelKeyUpdate, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { serializeVerifyKey } from '~/utils/serializationHelpers';

export default async function signHigherLevelKeyUpdate(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<HigherLevelKeyUpdate>,
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

    const updateKeysLength = transaction.payload.updateKeys.length;
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
        const verificationKey = transaction.payload.updateKeys[i];

        const data = Buffer.concat([
            serializeVerifyKey(verificationKey.verifyKey),
        ]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, INS, p1, p2, data);
    }

    p1 = 0x02;
    const thresholdData = Buffer.alloc(2);
    thresholdData.writeUInt16BE(transaction.payload.threshold, 0);

    const response = await transport.send(0xe0, INS, p1, p2, thresholdData);
    const signature = response.slice(0, 64);
    return signature;
}
