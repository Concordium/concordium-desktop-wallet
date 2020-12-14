import type Transport from '@ledgerhq/hw-transport';
import pathAsBuffer from './Path';
import { CredentialDeploymentInformation }  from '../../utils/types';

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
    let newAccount = Uint8Array.of(1);

    let verificationKeyListLength = credentialDeployment.values.account.keys.length;
    let data = Buffer.concat([pathPrefix, newAccount, Uint8Array.of(verificationKeyListLength)]);

    await transport.send(   
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        data
    );

    p1 = 0x01
    for (let i = 0; i < verificationKeyListLength; i += 1) {
        const verificationKey = credentialDeployment.values.account.keys[i];
        let data = Buffer.concat([Uint8Array.of(verificationKey.scheme), verificationKey.key]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(
            0xe0,
            INS_SIGN_CREDENTIAL_DEPLOYMENT,
            p1,
            p2,
            data
        );
    }

    let signatureThreshold = Uint8Array.of(credentialDeployment.values.account.threshold);
    let regId = credentialDeployment.values.regId;
    
    let identityProviderIdentity = Buffer.alloc(4);
    identityProviderIdentity.writeInt32BE(credentialDeployment.values.ipId, 0);

    let arThreshold = Uint8Array.of(credentialDeployment.values.revocationThreshold);
    let arListLength = credentialDeployment.values.arData.length;
    let arListLengthAsBytes = Uint8Array.of(arListLength);

    data = Buffer.concat([signatureThreshold, regId, identityProviderIdentity, arThreshold, arListLengthAsBytes])
    p1 = 0x02;
    await transport.send(
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        data
    );

    p1 = 0x03;
    for (let [arIdentity, encIdCredPub] of credentialDeployment.values.arData) {
        let arData = Buffer.alloc(4);
        arData.writeUInt32BE(arIdentity, 0);
        let data = Buffer.concat([arData, encIdCredPub]);

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
    let validTo = Buffer.alloc(3);
    validTo.writeUInt16BE(credentialDeployment.values.policy.validTo.year, 0);
    validTo.writeUInt8(credentialDeployment.values.policy.validTo.month, 2);

    let createAt = Buffer.alloc(3);
    createAt.writeUInt16BE(credentialDeployment.values.policy.validTo.year, 0);
    createAt.writeUInt8(credentialDeployment.values.policy.validTo.month, 2);

    let attributeListLength = credentialDeployment.values.policy.revealedAttributes.size;
    let attributeListLengthAsBytes = Buffer.alloc(2);
    attributeListLengthAsBytes.writeUInt16BE(attributeListLength, 0);

    data = Buffer.concat([validTo, createAt, attributeListLengthAsBytes]);
    await transport.send(
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        data
    );

    for (let [attributeTag, attributeValue] of credentialDeployment.values.policy.revealedAttributes) {
        let data = Buffer.alloc(2);
        data.writeUInt8(attributeTag, 0);
        let serializedAttributeValue = Buffer.from(attributeValue, 'utf-8');
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
    await transport.send(
        0xe0,
        INS_SIGN_CREDENTIAL_DEPLOYMENT,
        p1,
        p2,
        data
    );

    p1 = 0x08;
    var i, j, proofsChunk, chunk = 255;
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
