import { Transport } from './Transport';

const INS_EXPORT_PRIVATE_KEY_SEED = 0x05;

async function getAccountPrivateKeySeed(
    transport: Transport,
    p1: number,
    identity: number
): Promise<Buffer> {
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
    return response.slice(0, 32);
}

export async function getIdCredSec(
    transport: Transport,
    identity: number
): Promise<Buffer> {
    const idCredSecKeySeed = await getAccountPrivateKeySeed(
        transport,
        0x00,
        identity
    );
    return idCredSecKeySeed;
}

export async function getPrfKey(
    transport: Transport,
    identity: number
): Promise<Buffer> {
    const prfKeySeed = await getAccountPrivateKeySeed(
        transport,
        0x01,
        identity
    );
    return prfKeySeed;
}
