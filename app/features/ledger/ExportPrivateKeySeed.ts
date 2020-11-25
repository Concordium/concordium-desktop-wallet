import type Transport from '@ledgerhq/hw-transport';

const INS_EXPORT_PRIVATE_KEY_SEED = 0x05;

async function getAccountPrivateKeySeed(
    transport: Transport,
    p1: number,
    identity: number
): Promise<{ accountPrivateKeySeed: Buffer }> {
    const data = Buffer.alloc(4);
    data.writeInt32BE(identity, 0);

    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_EXPORT_PRIVATE_KEY_SEED,
        p1,
        p2,
        data
    );
    const accountPrivateKeySeed = response.slice(0, 32);

    return { accountPrivateKeySeed };
}

export async function getIdCredSec(
    transport: Transport,
    identity: number
): Promise<{ idCredSecSeed: Buffer }> {
    const idCredSecAccountPrivateKeySeed = await getAccountPrivateKeySeed(
        transport,
        0x00,
        identity
    );
    const idCredSecSeed = idCredSecAccountPrivateKeySeed.accountPrivateKeySeed;
    return { idCredSecSeed };
}

export async function getPrfKey(
    transport: Transport,
    identity: number
): Promise<{ prfKeySeed: Buffer }> {
    const idCredSecAccountPrivateKeySeed = await getAccountPrivateKeySeed(
        transport,
        0x01,
        identity
    );
    const prfKeySeed = idCredSecAccountPrivateKeySeed.accountPrivateKeySeed;
    return { prfKeySeed };
}
