/* eslint-disable no-await-in-loop */
import { Transport } from './Transport';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    UpdateInstruction,
} from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { serializeVerifyKey } from '~/utils/serializationHelpers';
import { chunkArray } from '~/utils/basicHelpers';

/**
 * Handles the serialization and sending of an access structure to the hardware
 * device.
 */
async function sendAccessStructure(
    accessStructure: AccessStructure,
    transport: Transport,
    INS: number
): Promise<Buffer> {
    const serializedAccessStructureSize = Buffer.alloc(2);
    serializedAccessStructureSize.writeUInt16BE(
        accessStructure.publicKeyIndicies.length,
        0
    );

    let p1 = 0x02;
    const p2 = 0x00;
    await transport.send(0xe0, INS, p1, p2, serializedAccessStructureSize);

    p1 = 0x03;
    // Chunk into bits of at most 127, as that is the maximum amount of data that
    // the Ledger can receive in one go.
    const chunkedIndicies = chunkArray(accessStructure.publicKeyIndicies, 127);
    for (const incidies of chunkedIndicies) {
        const serializedIndicies = Buffer.concat(
            incidies.map((index) => {
                const serializedIndex = Buffer.alloc(2);
                serializedIndex.writeUInt16BE(index, 0);
                return serializedIndex;
            })
        );
        await transport.send(0xe0, INS, p1, p2, serializedIndicies);
    }

    p1 = 0x04;
    const serializedThreshold = Buffer.alloc(2);
    serializedThreshold.writeUInt16BE(accessStructure.threshold, 0);
    return transport.send(0xe0, INS, p1, p2, serializedThreshold);
}

export default async function signAuthorizationKeysUpdate(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<AuthorizationKeysUpdate>,
    serializedPayload: Buffer,
    INS: number
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1,
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);

    let p1 = 0x00;
    const p2 = 0x00;

    const serializedKeyUpdateType = Buffer.alloc(1);
    serializedKeyUpdateType.writeInt8(transaction.payload.keyUpdateType, 0);

    const updateKeysLength = transaction.payload.keys.length;
    const serializedNumberOfUpdateKeys = Buffer.alloc(2);
    serializedNumberOfUpdateKeys.writeUInt16BE(updateKeysLength, 0);

    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
        serializedKeyUpdateType,
        serializedNumberOfUpdateKeys,
    ]);
    await transport.send(0xe0, INS, p1, p2, initialData);

    p1 = 0x01;
    for (let i = 0; i < updateKeysLength; i += 1) {
        const verificationKey = transaction.payload.keys[i];
        const data = serializeVerifyKey(verificationKey);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, INS, p1, p2, data);
    }

    const authorizationKeysUpdate: AuthorizationKeysUpdate =
        transaction.payload;
    await sendAccessStructure(
        authorizationKeysUpdate.emergency,
        transport,
        INS
    );
    await sendAccessStructure(authorizationKeysUpdate.protocol, transport, INS);
    await sendAccessStructure(
        authorizationKeysUpdate.electionDifficulty,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.euroPerEnergy,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.microGtuPerEuro,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.foundationAccount,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.mintDistribution,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.transactionFeeDistribution,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.gasRewards,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.bakerStakeThreshold,
        transport,
        INS
    );
    await sendAccessStructure(
        authorizationKeysUpdate.addAnonymityRevoker,
        transport,
        INS
    );

    const response = await sendAccessStructure(
        authorizationKeysUpdate.addIdentityProvider,
        transport,
        INS
    );
    const signature = response.slice(0, 64);
    return signature;
}
