import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';

const INS_PUBLIC_KEY = 0x01;

export default async function getPublicKey(
    transport: Transport,
    path: number[]
): Promise<{ publicKey: Buffer }> {
    const data = pathAsBuffer(path);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    const publicKey = response.slice(0, 32);

    return { publicKey };
}
