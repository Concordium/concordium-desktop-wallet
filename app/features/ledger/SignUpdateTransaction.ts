import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { UpdateInstruction, UpdateInstructionPayload } from '../../utils/types';
import pathAsBuffer from './Path';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

export default async function signUpdateTransaction(
    transport: Transport,
    ins: number,
    path: number[],
    transaction: UpdateInstruction<UpdateInstructionPayload>,
    serializedPayload: Buffer,
    p2 = 0x00
): Promise<Buffer> {
    const data = Buffer.concat([
        pathAsBuffer(path),
        serializeUpdateInstructionHeaderAndPayload(
            transaction,
            serializedPayload
        ),
    ]);

    const p1 = 0x00;

    const response = await transport.send(0xe0, ins, p1, p2, data);
    const signature = response.slice(0, 64);
    return signature;
}
