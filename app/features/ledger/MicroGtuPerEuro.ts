import type Transport from '@ledgerhq/hw-transport';
import { ExchangeRate, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

const INS_EXCHANGE_RATE = 0x06;

export default async function signUpdateMicroGtuPerEuro(
    transport: Transport,
    path: number[],
    serializedPayload: Buffer,
    transaction: UpdateInstruction<ExchangeRate>
): Promise<Buffer> {
    const data = Buffer.concat([
        pathAsBuffer(path),
        serializeUpdateInstructionHeaderAndPayload(
            transaction,
            serializedPayload
        ),
    ]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_EXCHANGE_RATE,
        p1,
        p2,
        data
    );
    const signature = response.slice(0, 64);
    return signature;
}
