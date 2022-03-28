import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { PoolParameters, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
    serializeCommisionRanges,
    serializeCommisionRates,
    serializeEquityBounds,
} from '~/utils/UpdateSerialization';

const INS_POOL_PARAMETERS = 0x41;

export default async function signPoolParameters(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<PoolParameters>,
    serializedPayload: Buffer
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);
    const serializedlPoolCommissions = serializeCommisionRates(
        transaction.payload.lPoolCommissions
    );

    // Send initial packet of data
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        serializedlPoolCommissions,
    ]);
    let p1 = 0x00;
    const p2 = 0x00;
    await transport.send(0xe0, INS_POOL_PARAMETERS, p1, p2, initialData);

    p1 = 0x01;
    await transport.send(
        0xe0,
        INS_POOL_PARAMETERS,
        p1,
        p2,
        serializeCommisionRanges(transaction.payload.commissionBounds)
    );

    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_POOL_PARAMETERS,
        p1,
        p2,
        serializeEquityBounds(transaction.payload)
    );
    const signature = response.slice(0, 64);
    return signature;
}
