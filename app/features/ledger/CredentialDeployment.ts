import type Transport from '@ledgerhq/hw-transport';
import {
    UnsignedCredentialDeploymentInformation,
    IdOwnershipProofs,
    CredentialDeploymentValues,
} from '../../utils/types';
import {
    putBase58Check,
    serializeVerifyKey,
    serializeYearMonth,
} from '../../utils/serializationHelpers';
import pathAsBuffer from './Path';

async function signCredentialValues(
    pathPrefix: Uint8Array,
    transport: Transport,
    credentialDeployment: CredentialDeploymentValues,
    ins: number,
    p1Offset: number
) {
    let p1 = 0x00 + p1Offset;
    const p2 = 0x00;

    const publicKeys = credentialDeployment.credentialPublicKeys;
    const verificationKeyListLength = Object.entries(publicKeys.keys).length;
    let data = Buffer.concat([
        pathPrefix,
        Uint8Array.of(verificationKeyListLength),
    ]);

    await transport.send(0xe0, ins, p1, p2, data);

    const keyIndices = Object.keys(publicKeys.keys)
        .map((idx) => parseInt(idx, 10))
        .sort();

    p1 = 0x01 + p1Offset;
    for (let i = 0; i < verificationKeyListLength; i += 1) {
        const index = keyIndices[i];
        const verificationKey = publicKeys.keys[index];
        data = Buffer.concat([
            Uint8Array.of(index),
            serializeVerifyKey(verificationKey),
        ]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    const signatureThreshold = Uint8Array.of(publicKeys.threshold);
    const credId = Buffer.from(credentialDeployment.credId, 'hex');

    const identityProviderIdentity = Buffer.alloc(4);
    identityProviderIdentity.writeInt32BE(credentialDeployment.ipIdentity, 0);

    const arThreshold = Uint8Array.of(credentialDeployment.revocationThreshold);
    const arListLength = Object.entries(credentialDeployment.arData).length;
    const arListLengthAsBytes = Uint8Array.of(arListLength);

    data = Buffer.concat([
        signatureThreshold,
        credId,
        identityProviderIdentity,
        arThreshold,
        arListLengthAsBytes,
    ]);
    p1 = 0x02 + p1Offset;
    await transport.send(0xe0, ins, p1, p2, data);

    p1 = 0x03 + p1Offset;

    const arIdentities = Object.keys(credentialDeployment.arData);
    for (let i = 0; i < arIdentities.length; i += 1) {
        const arIdentity = arIdentities[i];
        const encIdCredPub = Buffer.from(
            credentialDeployment.arData[arIdentity].encIdCredPubShare,
            'hex'
        );
        const arData = Buffer.alloc(4);
        arData.writeUInt32BE(parseInt(arIdentity, 10), 0);
        data = Buffer.concat([arData, encIdCredPub]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    p1 = 0x04 + p1Offset;
    const validTo = serializeYearMonth(credentialDeployment.policy.validTo);
    const createdAt = serializeYearMonth(credentialDeployment.policy.createdAt);

    const attributeListLength = Object.entries(
        credentialDeployment.policy.revealedAttributes
    ).length;
    const attributeListLengthAsBytes = Buffer.alloc(2);
    attributeListLengthAsBytes.writeUInt16BE(attributeListLength, 0);

    data = Buffer.concat([validTo, createdAt, attributeListLengthAsBytes]);
    await transport.send(0xe0, ins, p1, p2, data);

    const revealedAttributes = Object.keys(
        credentialDeployment.policy.revealedAttributes
    );
    for (let i = 0; i < revealedAttributes.length; i += 1) {
        const attributeTag = revealedAttributes[i];
        const attributeValue =
            credentialDeployment.policy.revealedAttributes[attributeTag];
        data = Buffer.alloc(2);
        data.writeUInt8(parseInt(attributeTag, 10), 0);
        const serializedAttributeValue = Buffer.from(attributeValue, 'utf-8');
        data.writeUInt8(serializedAttributeValue.length, 1);

        p1 = 0x05 + p1Offset;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);

        p1 = 0x06 + p1Offset;
        data = serializedAttributeValue;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }
}

function serializeIdOwnerShipProofs(proofs: IdOwnershipProofs) {
    const proofIdCredPub = Buffer.alloc(4);
    proofIdCredPub.writeInt32BE(
        Object.entries(proofs.proofIdCredPub).length,
        0
    );
    // TODO: Make sure that these are sorted, otherwise sort them.
    const idCredPubProofs = Buffer.concat(
        Object.entries(proofs.proofIdCredPub).map(([index, value]) => {
            const proof = Buffer.alloc(4 + 96);
            proof.writeInt32BE(parseInt(index, 10), 0);
            proof.write(value, 4, 100, 'hex');
            return proof;
        })
    );

    return Buffer.concat([
        Buffer.from(proofs.sig, 'hex'),
        Buffer.from(proofs.commitments, 'hex'),
        Buffer.from(proofs.challenge, 'hex'),
        proofIdCredPub,
        idCredPubProofs,
        Buffer.from(proofs.proofIpSig, 'hex'),
        Buffer.from(proofs.proofRegId, 'hex'),
        Buffer.from(proofs.credCounterLessThanMaxAccounts, 'hex'),
    ]);
}

const INS_SIGN_CREDENTIAL_DEPLOYMENT = 0x04;

async function signCredentialDeployment(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    newOrExisting: Buffer,
    path: number[]
): Promise<Buffer> {
    const pathPrefix = pathAsBuffer(path);

    const p2 = 0x00;

    await signCredentialValues(
        pathPrefix,
        transport,
        credentialDeployment,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        0
    );

    const proofs = serializeIdOwnerShipProofs(credentialDeployment.proofs);
    const proofLength = Buffer.alloc(4);
    proofLength.writeInt32BE(proofs.length, 0);
    let p1 = 0x07;
    await transport.send(
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        proofLength
    );

    p1 = 0x08;

    let i = 0;
    while (i < proofs.length) {
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            proofs.slice(i, Math.min(i + 255, proofs.length))
        );
        i += 255;
    }

    p1 = 0x09;
    const response = await transport.send(
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        newOrExisting
    );

    const signature = response.slice(0, 64);
    return signature;
}

export async function signNewCredentialDeployment(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    expiry: bigint,
    path: number[]
): Promise<Buffer> {
    const expiryBuffer = Buffer.alloc(1 + 64);
    expiryBuffer.writeInt8(0, 0);
    expiryBuffer.writeBigInt64BE(expiry, 1);
    return signCredentialDeployment(
        transport,
        credentialDeployment,
        expiryBuffer,
        path
    );
}

export async function signExistingCredentialDeployment(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    accountAddress: string,
    path: number[]
): Promise<Buffer> {
    const accountBuffer = Buffer.alloc(1 + 32);
    accountBuffer.writeInt8(1, 0);
    putBase58Check(accountBuffer, 1, accountAddress);
    return signCredentialDeployment(
        transport,
        credentialDeployment,
        accountBuffer,
        path
    );
}
