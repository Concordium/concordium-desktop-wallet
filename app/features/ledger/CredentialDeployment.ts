import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';
import { CredentialDeploymentInformation } from '../../utils/types';

const INS_SIGN_CREDENTIAL_DEPLOYMENT = 0x04;

export async function signCredentialDeployment(
    transport: Transport,
    credentialDeployment: CredentialDeploymentInformation,
    path: number[]
): Promise<Buffer> {
    const pathPrefix = pathAsBuffer(path);

    let p1 = 0x00;
    const p2 = 0x00;

    // TODO: Make this value an input to support updating credentials of existing accounts.
    const newAccount = Uint8Array.of(1);

    const verificationKeyListLength =
        credentialDeployment.account.keys.length;
    let data = Buffer.concat([
        pathPrefix,
        newAccount,
        Uint8Array.of(verificationKeyListLength),
    ]);

    await transport.send(0xe0, INS_SIGN_CREDENTIAL_DEPLOYMENT, p1, p2, data);

    p1 = 0x01;
    for (let i = 0; i < verificationKeyListLength; i += 1) {
        const verificationKey = credentialDeployment.account.keys[i];
        console.log(verificationKey);
        const data = Buffer.concat([
            Uint8Array.of(0), // verificationKey.schemeId
            Buffer.from(verificationKey.verifyKey, 'hex'),
        ]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            data
        );
    }

    const signatureThreshold = Uint8Array.of(
        credentialDeployment.account.threshold
    );
    const regId = Buffer.from(credentialDeployment.regId, 'hex');

    const identityProviderIdentity = Buffer.alloc(4);
    identityProviderIdentity.writeInt32BE(credentialDeployment.ipId, 0);

    const arThreshold = Uint8Array.of(
        credentialDeployment.revocationThreshold
    );
    const arListLength = credentialDeployment.arData.length;
    const arListLengthAsBytes = Uint8Array.of(arListLength);

    data = Buffer.concat([
        signatureThreshold,
        regId,
        identityProviderIdentity,
        arThreshold,
        arListLengthAsBytes,
    ]);
    p1 = 0x02;
    await transport.send(0xe0, INS_SIGN_CREDENTIAL_DEPLOYMENT, p1, p2, data);

    p1 = 0x03;

    for (const arIdentity of Object.keys(credentialDeployment.arData)) {
        const encIdCredPub = Buffer.from(credentialDeployment.arData[arIdentity].encIdCredPubShare, 'hex');
        const arData = Buffer.alloc(4);
        arData.writeUInt32BE(arIdentity, 0);
        const data = Buffer.concat([arData, encIdCredPub]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            data
        );
    }

    p1 = 0x04;
    const validTo = Buffer.alloc(3);
    const ValidToYear = parseInt(credentialDeployment.policy.validTo.substring(0,4));
    const ValidToMonth = parseInt(credentialDeployment.policy.validTo.substring(4,6));

    validTo.writeUInt16BE(ValidToYear, 0);
    validTo.writeUInt8(ValidToMonth, 2);

    const createdAt = Buffer.alloc(3);
    const createdAtYear = parseInt(credentialDeployment.policy.createdAt.substring(0,4));
    const createdAtMonth = parseInt(credentialDeployment.policy.createdAt.substring(4,6));

    createdAt.writeUInt16BE(createdAtYear, 0);
    createdAt.writeUInt8(createdAtMonth, 2);

    const attributeListLength =
        credentialDeployment.policy.revealedAttributes.size;
    const attributeListLengthAsBytes = Buffer.alloc(2);
    attributeListLengthAsBytes.writeUInt16BE(attributeListLength, 0);

    data = Buffer.concat([validTo, createdAt, attributeListLengthAsBytes]);
    await transport.send(0xe0, INS_SIGN_CREDENTIAL_DEPLOYMENT, p1, p2, data);

    for (const attributeTag of Object.keys (credentialDeployment
        .policy.revealedAttributes)) {
        const attributeValue  = credentialDeployment
            .policy.revealedAttributes[attributeTag];
        let data = Buffer.alloc(2);
        data.writeUInt8(attributeTag, 0);
        const serializedAttributeValue = Buffer.from(attributeValue, 'utf-8');
        data.writeUInt8(serializedAttributeValue.length, 1);

        // eslint-disable-next-line  no-await-in-loop
        p1 = 0x05;
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            data
        );

        // eslint-disable-next-line  no-await-in-loop
        p1 = 0x06;
        data = serializedAttributeValue;
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            data
        );
    }

    data = Buffer.alloc(4);
    data.writeUInt32BE(credentialDeployment.proofs.length, 0);
    p1 = 0x07;
    await transport.send(0xe0, INS_SIGN_CREDENTIAL_DEPLOYMENT, p1, p2, data);

    p1 = 0x08;
    let i;
    let j;
    let proofsChunk;
    const chunk = 255;
    let result;
    for (i = 0, j = credentialDeployment.proofs.length; i < j; i += chunk) {
        proofsChunk = credentialDeployment.proofs.slice(i, i + chunk);

        result = await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            Buffer.from(proofsChunk)
        );
    }

    return result.slice(0, 32);
}
