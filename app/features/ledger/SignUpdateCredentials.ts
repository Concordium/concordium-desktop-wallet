import type Transport from '@ledgerhq/hw-transport';
import { UpdateAccountCredentials, TransactionKindId } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
} from '../../utils/transactionSerialization';
import { serializeCredentialDeploymentInformation } from '../../utils/serializationHelpers';

const INS_UPDATE_CREDENTIALS = 0x21; // TODO: set

// TODO: serialize the payload properly / divide into appropiate chunks.

export default async function signUpdateCredentials(
    transport: Transport,
    path: number[],
    transaction: UpdateAccountCredentials
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        TransactionKindId.Update_credentials,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const addedCredentialsLength = Object.entries(
        transaction.payload.addedCredentials
    ).length;
    const removedCredentialsLength = transaction.payload.removedCredIds.length;

    const kindAndAddedLength = Buffer.alloc(2);
    kindAndAddedLength.writeInt8(TransactionKindId.Update_credentials, 0);
    kindAndAddedLength.writeInt8(addedCredentialsLength, 1);

    let data = Buffer.concat([pathAsBuffer(path), header, kindAndAddedLength]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_UPDATE_CREDENTIALS, p1, p2, data);

    p1 = 0x01;
    const addedIndices = Object.keys(transaction.payload.addedCredentials);
    for (let i = 0; i < addedCredentialsLength; i += 1) {
        const index = parseInt(addedIndices[i], 10);
        const credentialInformation =
            transaction.payload.addedCredentials[index];
        data = Buffer.concat([
            Uint8Array.of(index),
            serializeCredentialDeploymentInformation(credentialInformation), // TODO: Split this up
        ]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, INS_UPDATE_CREDENTIALS, p1, p2, data);
    }

    p1 = 0x02;
    data = Buffer.alloc(1);
    data.writeUInt8(removedCredentialsLength, 0);

    await transport.send(0xe0, INS_UPDATE_CREDENTIALS, p1, p2, data);

    p1 = 0x03;
    for (let i = 0; i < removedCredentialsLength; i += 1) {
        const removedCredId = transaction.payload.removedCredIds[i];
        data = Buffer.from(removedCredId, 'hex');

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, INS_UPDATE_CREDENTIALS, p1, p2, data);
    }

    p1 = 0x04;
    data = Buffer.alloc(1);
    data.writeUInt8(transaction.payload.newThreshold, 0);

    const response = await transport.send(
        0xe0,
        INS_UPDATE_CREDENTIALS,
        p1,
        p2,
        data
    );

    const signature = response.slice(0, 64);
    return signature;
}
