import { Transport } from './Transport';
import pathAsBuffer from './Path';

const INS_VERIFY_ADDRESS = 0x36;

export default async function verifyAddress(
    transport: Transport,
    path: number[]
): Promise<void> {
    const data = pathAsBuffer(path);
    const p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_VERIFY_ADDRESS, p1, p2, data);
}
