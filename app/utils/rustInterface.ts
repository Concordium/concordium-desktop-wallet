import PromiseWorker from 'promise-worker';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import RustWorker from './rust.worker';
import {
    PublicInformationForIp,
    Identity,
    IpInfo,
    SchemeId,
    ArInfo,
    Account,
    CredentialDeploymentDetails,
    VerifyKey,
} from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';
import { toHex } from './serializationHelpers';

const rawWorker = new RustWorker();
const worker = new PromiseWorker(rawWorker);

type Global = any; // TODO: add Global type

/**
 * Returns the PrfKey and IdCredSec seeds for the given identity.
 */
async function getSecretsFromLedger(
    ledger: ConcordiumLedgerClient,
    displayMessage: (message: string) => void,
    identityNumber: number
) {
    displayMessage('Please confirm exporting prf key on device');
    const prfKeySeed = await ledger.getPrfKey(identityNumber);

    displayMessage('Please confirm exporting id cred sec on device');
    const idCredSecSeed = await ledger.getIdCredSec(identityNumber);

    const prfKey = prfKeySeed.toString('hex');
    const idCredSec = idCredSecSeed.toString('hex');
    return { prfKey, idCredSec };
}

// Given a list of Keys, for each key, attempts to prepend the schemeId
// onto the key hex value, and returns the prepended versions.
function prependKeyType(keys: VerifyKey[]) {
    return keys.map((key) => {
        if (key.schemeId in SchemeId) {
            return {
                schemeId: key.schemeId,
                verifyKey: `${toHex(SchemeId[key.schemeId], 2)}${
                    key.verifyKey
                }`,
            };
        }
        throw new Error('Unknown key type');
    });
}

/**
 *  This function creates an IdentityObjectRequest using the ledger, given the nesessary information and the identity number on the ledger.
 * Returns the IdentityObjectRequest and the randomness used to generate it.
 */
export async function createIdentityRequestObjectLedger(
    identityNumber: number,
    ipInfo: IpInfo,
    arsInfos: Record<string, ArInfo>,
    global: Global,
    displayMessage: (message: string) => void
) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identityNumber
    );
    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey([
        0,
        0,
        identityNumber,
        2,
        0,
        0,
    ]);
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

    const pubInfoForIp: PublicInformationForIp = JSON.parse(pubInfoForIpString);

    pubInfoForIp.publicKeys.keys = prependKeyType(pubInfoForIp.publicKeys.keys);

    const path = {
        identityIndex: identityNumber,
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

/**
 *  This function creates a CredentialDeploymentInfo using the ledger, given the nesessary information and the account number.
 *  Returns a CredentialDeploymentDetails object, which contains the CredentialDeploymentInfo,
 *  and it's hex, and it's hash (transactionId), and the account address.
 */
export async function createCredential(
    identity: Identity,
    accountNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient
): Promise<CredentialDeploymentDetails> {
    const identityProvider = JSON.parse(identity.identityProvider);

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identity.id
    );
    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey([
        0,
        0,
        identity.id,
        2,
        accountNumber,
        0,
    ]);
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

/**
 * Given a list of encrypted Amounts, and the associated account, and nesessary details
 * returns a list of the given amount, decrypted.
 */
export async function decryptAmounts(
    encryptedAmounts: string[],
    account: Account,
    global: Global,
    prfKey: string
): Promise<string[]> {
    const input = {
        global,
        accountNumber: account.accountNumber,
        prfKey,
        encryptedAmounts,
    };

    const decryptedAmounts = await worker.postMessage({
        command: workerCommands.decryptAmounts,
        input: JSON.stringify(input),
    });
    return JSON.parse(decryptedAmounts);
}
