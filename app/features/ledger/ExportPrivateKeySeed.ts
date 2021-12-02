import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { BlsKeyTypes, PrivateKeys } from '~/utils/types';

const INS_EXPORT_PRIVATE_KEY_SEED = 0x05;
const P1_PRF_KEY = 0;
const P1_PRF_KEY_RECOVERY = 1;
const P1_BOTH_KEYS = 2;
const P2_SEEDS = 1;

function getP2(keyType: BlsKeyTypes): number {
    switch (keyType) {
        case BlsKeyTypes.Seed:
            return P2_SEEDS;
        case BlsKeyTypes.Key:
            return 0x02;
        default:
            throw new Error('Unknown identity version');
    }
}

function requestKeys(
    transport: Transport,
    p1: number,
    p2: number,
    identity: number
) {
    const data = Buffer.alloc(4);
    data.writeInt32BE(identity, 0);

    return transport.send(0xe0, INS_EXPORT_PRIVATE_KEY_SEED, p1, p2, data);
}

/**
 * Requests the prf key and id cred sec for the identity number from the connected Ledger, with "create credential" on the display.
 * @param identity the identity index for which to get the keys for.
 * @param keyType the type of key that will be returned, either the keys' seeds or the actual bls keys.
 */
export async function getPrivateKeys(
    transport: Transport,
    identity: number,
    keyType: BlsKeyTypes
): Promise<PrivateKeys> {
    const response = await requestKeys(
        transport,
        P1_BOTH_KEYS,
        getP2(keyType),
        identity
    );
    const prfKey = response.slice(0, 32);
    const idCredSec = response.slice(32, 64);
    return { idCredSec, prfKey };
}

/**
 * Requests the prf key for the identity number from the connected Ledger, with "decrypt" on the display.
 * @param identity the identity index for which to get the prf key for.
 * @param keyType the type of key that will be returned, either the keys' seeds or the actual bls keys.
 */
export async function getPrfKeyDecrypt(
    transport: Transport,
    identity: number,
    keyType: BlsKeyTypes
): Promise<Buffer> {
    const response = await requestKeys(
        transport,
        P1_PRF_KEY,
        getP2(keyType),
        identity
    );
    return response.slice(0, 32);
}

/**
 * Recovery always exports the seed, because it needs to check both versions.
 */
export async function getPrfKeyRecovery(
    transport: Transport,
    identity: number
): Promise<Buffer> {
    const response = await requestKeys(
        transport,
        P1_PRF_KEY_RECOVERY,
        P2_SEEDS,
        identity
    );
    return response.slice(0, 32);
}
