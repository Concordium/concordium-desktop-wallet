import { Buffer } from 'buffer/';
import EventEmitter from 'events';
import { Transport } from './Transport';
import {
    UpdateAccountCredentials,
    TransactionKindId,
    CredentialDeploymentInformation,
} from '~/utils/types';
import pathAsBuffer from './Path';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
} from '~/utils/transactionSerialization';
import {
    signCredentialValues,
    signCredentialProofs,
} from './CredentialDeployment';

const INS_UPDATE_CREDENTIALS = 0x31;

export default async function signUpdateCredentials(
    transport: Transport,
    path: number[],
    transaction: UpdateAccountCredentials,
    eventEmitter: EventEmitter
): Promise<Buffer> {
    const pathPrefix = pathAsBuffer(path);
    const ins = INS_UPDATE_CREDENTIALS;

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
    const addedCredentials: [
        number,
        CredentialDeploymentInformation
    ][] = transaction.payload.addedCredentials.map(({ index, value }) => [
        index,
        value,
    ]);

    const addedCredentialsLength = addedCredentials.length;
    const removedCredentialsLength = transaction.payload.removedCredIds.length;

    const kindAndAddedLength = Buffer.alloc(2);
    kindAndAddedLength.writeUInt8(TransactionKindId.Update_credentials, 0);
    kindAndAddedLength.writeUInt8(addedCredentialsLength, 1);

    let data = Buffer.concat([pathPrefix, header, kindAndAddedLength]);

    const p1 = 0x00;
    let p2 = 0x00;

    await transport.send(0xe0, ins, p1, p2, data);

    for (let i = 0; i < addedCredentialsLength; i += 1) {
        const [index, credentialInformation] = addedCredentials[i];
        data = Buffer.alloc(1);
        data.writeUInt8(index, 0);
        // eslint-disable-next-line  no-await-in-loop
        p2 = 0x01;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
        p2 = 0x02;
        // eslint-disable-next-line  no-await-in-loop
        await signCredentialValues(
            transport,
            credentialInformation,
            ins,
            p2,
            true,
            true,
            eventEmitter
        );
        // eslint-disable-next-line  no-await-in-loop
        await signCredentialProofs(
            transport,
            Buffer.from(credentialInformation.proofs, 'hex'),
            ins,
            p2
        );
    }

    p2 = 0x03;
    data = Buffer.alloc(1);
    data.writeUInt8(removedCredentialsLength, 0);

    await transport.send(0xe0, ins, p1, p2, data);

    p2 = 0x04;
    for (let i = 0; i < removedCredentialsLength; i += 1) {
        const removedCredId = transaction.payload.removedCredIds[i];
        data = Buffer.from(removedCredId, 'hex');

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    p2 = 0x05;
    data = Buffer.alloc(1);
    data.writeUInt8(transaction.payload.threshold, 0);

    const response = await transport.send(0xe0, ins, p1, p2, data);

    const signature = response.slice(0, 64);
    return signature;
}
