import type Transport from '@ledgerhq/hw-transport';
import { UpdateInstruction } from '../../utils/types';
import pathAsBuffer, { getGovernancePath } from './Path';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

const INS_EXCHANGE_RATE = 0x06;

export default async function signUpdateMicroGtuPerEuro(
    transport: Transport,
    transaction: UpdateInstruction
): Promise<Buffer> {
    const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
    const data = Buffer.concat([
        pathAsBuffer(path),
        serializeUpdateInstructionHeaderAndPayload(transaction),
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
