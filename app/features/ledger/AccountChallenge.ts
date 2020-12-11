import type Transport from '@ledgerhq/hw-transport';

const INS_SIGN_CHALLENGE = 0x30;

export async function signAccountChallenge(
    transport: Transport,
    challenge: Buffer
): Promise<Buffer> {

    if (challenge.length > 32) {
        throw new Error('The account challenge has to be exactly 32 bytes.');
    }

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_SIGN_CHALLENGE,
        p1,
        p2,
        challenge
    );

    return response.slice(0, 32);
}