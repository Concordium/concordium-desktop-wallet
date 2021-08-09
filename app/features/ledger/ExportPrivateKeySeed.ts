import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { PrivateKeySeeds } from '~/utils/types';

const INS_EXPORT_PRIVATE_KEY_SEED = 0x05;
const P1_PRF_KEY = 0;
const P1_BOTH_KEYS = 1;

export async function getPrivateKeySeeds(
    transport: Transport,
    identity: number
): Promise<PrivateKeySeeds> {
    const data = Buffer.alloc(4);
    data.writeInt32BE(identity, 0);

    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_EXPORT_PRIVATE_KEY_SEED,
        P1_BOTH_KEYS,
        p2,
        data
    );
    const prfKey = response.slice(0, 32);
    const idCredSec = response.slice(32, 64);
    return { idCredSec, prfKey };
}

export async function getPrfKey(
    transport: Transport,
    identity: number
): Promise<Buffer> {
    const data = Buffer.alloc(4);
    data.writeInt32BE(identity, 0);

    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_EXPORT_PRIVATE_KEY_SEED,
        P1_PRF_KEY,
        p2,
        data
    );
    return response.slice(0, 32);
}
