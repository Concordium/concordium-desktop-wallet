import PromiseWorker from 'promise-worker';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import RustWorker from 'worker-loader!./rust.worker';
import { PublicInformationForIP } from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';
import { sendTransaction } from './client';

export async function createIdentityRequestObjectLedger(
    identity,
    ipInfo,
    arsInfos,
    global,
    displayMessage
) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    displayMessage('Please confirm exporting prf key on device');
    const prfKeySeed = await ledger.getPrfKey(identity);

    displayMessage('Please confirm exporting id cred sec on device');
    const idCredSecSeed = await ledger.getIdCredSec(identity);

    const prfKey = prfKeySeed.toString('hex');
    const idCredSec = idCredSecSeed.toString('hex');
    displayMessage('Please wait');

    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey([0, 0, identity, 2, 0, 0]);
    displayMessage('Please wait');

    const rawWorker = new RustWorker();
    const worker = new PromiseWorker(rawWorker);

    const context = {
        ipInfo,
        arsInfos,
        global: global.value,
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: publicKey.toString('hex'),
            },
        ],
        threshold: 1,
    };

    const contextString = JSON.stringify(context);

    const pubInfoForIpString = await worker.postMessage({
        command: workerCommands.buildPublicInformationForIp,
        context: contextString,
        idCredSec,
        prfKey,
    });

    console.log(pubInfoForIpString);
    const pubInfoForIp: PublicInformationForIP = JSON.parse(pubInfoForIpString);
    pubInfoForIp.publicKeys.keys[0].verifyKey = `00${pubInfoForIp.publicKeys.keys[0].verifyKey}`; // TODO: attach schemeId properly.

    const path = {
        identityIndex: identity,
        accountIndex: 0,
        signatureIndex: 0,
    };

    displayMessage(`
Please sign information on device:
Identity Credentials Public (IdCredPub): ${pubInfoForIp.idCredPub}
Registration ID (RegId): ${pubInfoForIp.regId}
Verification Key: ${pubInfoForIp.publicKeys.keys[0].verifyKey}
Threshold: ${pubInfoForIp.publicKeys.threshold}
`);
    const signature = await ledger.signPublicInformationForIp(
        pubInfoForIp,
        path
    );
    displayMessage('Please wait');
    const dataString = await worker.postMessage({
        command: workerCommands.createIdRequest,
        context: contextString,
        signature: signature.toString('hex'),
        idCredSec,
        prfKey,
    });
    const data = JSON.parse(dataString);

    return {
        idObjectRequest: data.idObjectRequest,
        randomness: data.randomness_wrapped.randomness
    };
}

export async function createCredential(
    identity,
    accountNumber,
    global,
    displayMessage,
    ledger
) {
    const identityProvider = JSON.parse(identity.identityProvider);

    const rawWorker = new RustWorker();
    const worker = new PromiseWorker(rawWorker);
    const path = [0, 0, identity.id, 2, accountNumber, 0];

    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey(path);
    displayMessage('Please wait');

    displayMessage('Please confirm exporting prf key on device');
    const prfKeySeed = await ledger.getPrfKey(identity.id);

    displayMessage('Please confirm exporting id cred sec on device');
    const idCredSecSeed = await ledger.getIdCredSec(identity.id);
    displayMessage('Please wait');

    const credentialInput = {
        ipInfo: identityProvider.ipInfo,
        arsInfos: identityProvider.arsInfos,
        global,
        identityObject: JSON.parse(identity.identityObject).value, // TODO: perhaps do this onload?
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: publicKey.toString('hex'),
            },
        ],
        threshold: 1,
        accountNumber,
        revealedAttributes: [],
        randomness: {
            randomness: identity.randomness,
        },
        prfKey: prfKeySeed.toString('hex'),
        idCredSec: idCredSecSeed.toString('hex'),
    };

    const unsignedCredentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createUnsignedCredential,
        input: JSON.stringify(credentialInput),
    });
    console.log(unsignedCredentialDeploymentInfoString);
    const unsignedCredentialDeploymentInfo = JSON.parse(
        unsignedCredentialDeploymentInfoString
    );
    console.log(unsignedCredentialDeploymentInfo);
    displayMessage(`
Please sign challenge on device:
Challenge: ${unsignedCredentialDeploymentInfo.unsigned_challenge}
`);
    console.log(unsignedCredentialDeploymentInfo.unsigned_challenge);
    const challengeSignature = await ledger.signAccountChallenge(
        Buffer.from(unsignedCredentialDeploymentInfo.unsigned_challenge, 'hex'),
        path
    );
    displayMessage('Please wait');

    const credentialDeploymentInfo = await worker.postMessage({
        command: workerCommands.createCredential,
        input: JSON.stringify({
            unsignedInfo: unsignedCredentialDeploymentInfo,
            signature: challengeSignature.toString('hex'),
        }),
    });
    return JSON.parse(credentialDeploymentInfo);
}
