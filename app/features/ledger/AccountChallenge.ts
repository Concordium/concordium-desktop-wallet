import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';

const INS_SIGN_CHALLENGE = 0x30;

export async function signAccountChallenge(
    transport: Transport,
    path: number[],
    challenge: Buffer
): Promise<Buffer> {
    if (challenge.length !== 32) {
        throw new Error('The account challenge has to be exactly 32 bytes.');
    }

    const data = Buffer.concat([pathAsBuffer(path), challenge]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_SIGN_CHALLENGE,
        p1,
        p2,
        data
    );

    return response.slice(0, 64);
}
