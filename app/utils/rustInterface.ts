import PromiseWorker from 'promise-worker';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error : has no default export.
import RustWorker from './rust.worker';
import {
    PublicInformationForIp,
    Identity,
    IpInfo,
    ArInfo,
    Account,
    CredentialDeploymentDetails,
    CredentialDeploymentInformation,
    Global,
} from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';
import { getDefaultExpiry } from './timeHelpers';
import { stringify } from './JSONHelper';

const rawWorker = new RustWorker();
const worker = new PromiseWorker(rawWorker);

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

/**
 *  This function creates an IdentityObjectRequest using the ledger, given the nesessary information and the identity number on the ledger.
 * Returns the IdentityObjectRequest and the randomness used to generate it.
 */
export async function createIdentityRequestObjectLedger(
    identityNumber: number,
    ipInfo: IpInfo,
    arsInfos: Record<string, ArInfo>,
    global: Global,
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient
) {
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
        global,
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

async function createUnsignedCredentialInfo(
    identity: Identity,
    accountNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient,
    address?: string
) {
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

    const identityProvider = JSON.parse(identity.identityProvider);

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
        address,
    };

    const unsignedCredentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createUnsignedCredential,
        input: JSON.stringify(credentialInput),
    });

    try {
        return {
            raw: unsignedCredentialDeploymentInfoString,
            parsed: JSON.parse(unsignedCredentialDeploymentInfoString),
        };
    } catch (e) {
        throw new Error(unsignedCredentialDeploymentInfoString);
    }
}

/**
 *  This function creates a CredentialDeploymentInfo using the ledger, given the nesessary information and the account number.
 * N.B. This function is to construct a credential for an existing account.
 */
export async function createCredentialInfo(
    identity: Identity,
    accountNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient,
    address: string
): Promise<CredentialDeploymentInformation> {
    const { raw, parsed } = await createUnsignedCredentialInfo(
        identity,
        accountNumber,
        global,
        attributes,
        displayMessage,
        ledger,
        address
    );

    // TODO: Display the appropiate details
    displayMessage(`Please sign details on device.`);
    // Adding credential on an existing account
    const path = [0, 0, identity.id, 2, accountNumber, 0]; // TODO change path
    const signature = await ledger.signExistingCredentialDeployment(
        parsed,
        address,
        path
    );

    const credentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createCredentialInfo,
        signature: signature.toString('hex'),
        unsignedInfo: raw,
    });

    displayMessage('Please wait');
    return JSON.parse(credentialDeploymentInfoString);
}

/**
 *  This function creates a CredentialDeploymentInfo using the ledger, given the nesessary information and the account number.
 *  Returns a CredentialDeploymentDetails object, which contains the CredentialDeploymentInfo,
 *  and it's hex, and it's hash (transactionId), and the account address.
 * N.B. This function is to construct a credential for a new account.
 */
export async function createCredentialDetails(
    identity: Identity,
    accountNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient
): Promise<CredentialDeploymentDetails> {
    const { raw, parsed } = await createUnsignedCredentialInfo(
        identity,
        accountNumber,
        global,
        attributes,
        displayMessage,
        ledger
    );

    // TODO: Display the appropiate details
    displayMessage(`Please sign details on device.`);
    // Adding credential on a new account
    const expiry = getDefaultExpiry();
    const path = [0, 0, identity.id, 2, accountNumber, 0];
    const signature = await ledger.signNewCredentialDeployment(
        parsed,
        expiry,
        path
    );
    const credentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createCredentialDetails,
        signature: signature.toString('hex'),
        unsignedInfo: raw,
        expiry: stringify(expiry),
    });
    displayMessage('Please wait');

    try {
        const output = JSON.parse(credentialDeploymentInfoString);

        return {
            credentialDeploymentInfoHex: output.hex,
            accountAddress: output.address,
            credentialDeploymentInfo: output.credInfo,
            transactionId: output.hash,
        };
    } catch (e) {
        throw new Error(credentialDeploymentInfoString);
    }
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
