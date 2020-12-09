import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';
import { PublicInformationForIp } from '../../utils/types';

const INS_PUBLIC_INFO_FOR_IP = 0x20;

export default async function signPublicInformationForIp(
    transport: Transport,
    path: number[],
    publicInfoForIp: PublicInformationForIp
): Promise<Buffer> {
    const idCredPubBytes = Buffer.from(publicInfoForIp.idCredPub, 'hex');
    const regId = Buffer.from(publicInfoForIp.regId, 'hex');
    const verificationKeysListLength = Uint8Array.of(
        publicInfoForIp.publicKeys.keys.length
    );

    const data = Buffer.concat([
        pathAsBuffer(path),
        idCredPubBytes,
        regId,
        verificationKeysListLength,
    ]);
    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_PUBLIC_INFO_FOR_IP, p1, p2, data);

    p1 = 0x01;
    for (let i = 0; i < verificationKeysListLength; i += 1) {
        const verificationKey = publicInfoForIp.publicKeys.keys[i];

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(
            0xe0,
            INS_PUBLIC_INFO_FOR_IP,
            p1,
            p2,
            Buffer.from(verificationKey.verifyKey, 'hex')
        );
    }

    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_PUBLIC_INFO_FOR_IP,
        p1,
        p2,
        Buffer.of(publicInfoForIp.publicKeys.threshold)
    );

    const signature = response.slice(0, 64);
    return signature;
}
