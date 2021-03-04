import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';

const INS_PUBLIC_KEY = 0x01;

export async function getPublicKey(
    transport: Transport,
    path: number[]
): Promise<Buffer> {
    const data = pathAsBuffer(path);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    return response.slice(0, 32);
}

export async function getPublicKeySilent(
    transport: Transport,
    path: number[]
): Promise<Buffer> {
    const data = pathAsBuffer(path);

    const p1 = 0x01;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    return response.slice(0, 32);
}
