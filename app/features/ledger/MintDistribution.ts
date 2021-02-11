import type Transport from '@ledgerhq/hw-transport';
import { MintDistribution, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

const INS_FOUNDATION_ACCOUNT = 0x25;

export default async function signUpdateMintDistribution(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<MintDistribution>,
    serializedPayload: Buffer
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
        INS_FOUNDATION_ACCOUNT,
        p1,
        p2,
        data
    );
    const signature = response.slice(0, 64);
    return signature;
}
