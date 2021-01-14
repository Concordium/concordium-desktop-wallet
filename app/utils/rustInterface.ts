import PromiseWorker from 'promise-worker';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import RustWorker from 'worker-loader!./rust.worker';
import { PublicInformationForIP } from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';

const rawWorker = new RustWorker();
const worker = new PromiseWorker(rawWorker);

async function getSecretsFromLedger(ledger, displayMessage, identity) {
    displayMessage('Please confirm exporting prf key on device');
    const prfKeySeed = await ledger.getPrfKey(identity);

    displayMessage('Please confirm exporting id cred sec on device');
    const idCredSecSeed = await ledger.getIdCredSec(identity);

    displayMessage('Please wait');
    const prfKey = prfKeySeed.toString('hex');
    const idCredSec = idCredSecSeed.toString('hex');
    return { prfKey, idCredSec };
}

async function getPublicKeyFromLedger(
    ledger,
    displayMessage,
    identity,
    account
) {
    displayMessage('Please confirm exporting public key on device');
    return ledger.getPublicKey([0, 0, identity, 2, account, 0]);
}

function prependKeyType(keys) {
    return keys.map((key) => {
        if (key.schemeId === 'Ed25519') {
            key.verifyKey = `00${key.verifyKey}`;
        } else {
            throw new Error('Unknown key type');
        }
        return key;
    });
}

export async function createIdentityRequestObjectLedger(
    identity,
    ipInfo,
    arsInfos,
    global,
    displayMessage
) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identity
    );
    const publicKey = await getPublicKeyFromLedger(
        ledger,
        displayMessage,
        identity,
        0
    );

    displayMessage('Please wait');

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

    const pubInfoForIp: PublicInformationForIP = JSON.parse(pubInfoForIpString);

    prependKeyType(pubInfoForIp.publicKeys.keys);

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
        randomness: data.randomness_wrapped.randomness,
    };
}

export async function createCredential(
    identity,
    accountNumber,
    global,
    attributes,
    displayMessage,
    ledger
): CredentialDeploymentDetails {
    const identityProvider = JSON.parse(identity.identityProvider);

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identity.id
    );
    const publicKey = await getPublicKeyFromLedger(
        ledger,
        displayMessage,
        identity.id,
        accountNumber
    );
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
        revealedAttributes: attributes,
        randomness: {
            randomness: identity.randomness,
        },
        prfKey,
        idCredSec,
    };

    const unsignedCredentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createUnsignedCredential,
        input: JSON.stringify(credentialInput),
    });

    const unsignedCredentialDeploymentInfo = JSON.parse(
        unsignedCredentialDeploymentInfoString
    );
    displayMessage(`
Please sign challenge on device:
Challenge: ${unsignedCredentialDeploymentInfo.accountOwnershipChallenge}
`);
    const path = [0, 0, identity.id, 2, accountNumber, 0];
    const challengeSignature = await ledger.signAccountChallenge(
        Buffer.from(
            unsignedCredentialDeploymentInfo.accountOwnershipChallenge,
            'hex'
        ),
        path
    );
    displayMessage('Please wait');

    const credentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createCredential,
        signature: challengeSignature.toString('hex'),
        unsignedInfo: unsignedCredentialDeploymentInfoString,
    });
    const output = JSON.parse(credentialDeploymentInfoString);

    return {
        credentialDeploymentInfoHex: output.hex,
        accountAddress: output.address,
        credentialDeploymentInfo: output.credInfo,
        transactionId: output.hash,
    };
}
