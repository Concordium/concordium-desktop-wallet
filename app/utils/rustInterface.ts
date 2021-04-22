import PromiseWorker from 'promise-worker';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error : has no default export.
import RustWorker from './rust.worker';
import {
    PublicInformationForIp,
    Identity,
    IpInfo,
    ArInfo,
    Versioned,
    CredentialDeploymentDetails,
    CredentialDeploymentInformation,
    Global,
    AccountEncryptedAmount,
    GenesisCredential,
} from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';
import { getDefaultExpiry } from './timeHelpers';
import { getAccountPath } from '~/features/ledger/Path';
import { stringify, parse } from './JSONHelper';

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
    credentialNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient,
    address?: string
) {
    const path = getAccountPath({
        identityIndex: identity.id,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identity.id
    );
    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey(path);
    displayMessage('Please wait');

    const identityProvider = JSON.parse(identity.identityProvider);

    const credentialInput: Record<string, unknown> = {
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
        credentialNumber,
        revealedAttributes: attributes,
        randomness: {
            randomness: identity.randomness,
        },
        prfKey,
        idCredSec,
    };
    if (address) {
        credentialInput.address = address;
    }

    const unsignedCredentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createUnsignedCredential,
        input: stringify(credentialInput),
    });

    try {
        return {
            raw: unsignedCredentialDeploymentInfoString,
            parsed: JSON.parse(unsignedCredentialDeploymentInfoString),
        };
    } catch (e) {
        throw new Error(
            `Unable to create unsigned credential due to unexpected output: ${unsignedCredentialDeploymentInfoString}`
        );
    }
}

/**
 *  This function creates a CredentialDeploymentInfo using the ledger, given the nesessary information and the account number.
 * N.B. This function is to construct a credential for an existing account.
 */
export async function createCredentialInfo(
    identity: Identity,
    credentialNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient,
    address: string
): Promise<CredentialDeploymentInformation> {
    const { raw, parsed } = await createUnsignedCredentialInfo(
        identity,
        credentialNumber,
        global,
        attributes,
        displayMessage,
        ledger,
        address
    );

    // TODO: Display the appropiate details
    displayMessage(`Please sign details on device.`);
    // Adding credential on an existing account
    const path = getAccountPath({
        identityIndex: identity.id,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });
    const signature = await ledger.signCredentialDeploymentOnExistingAccount(
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
    credentialNumber: number,
    global: Global,
    attributes: string[],
    displayMessage: (message: string) => void,
    ledger: ConcordiumLedgerClient
): Promise<CredentialDeploymentDetails> {
    const { raw, parsed } = await createUnsignedCredentialInfo(
        identity,
        credentialNumber,
        global,
        attributes,
        displayMessage,
        ledger
    );

    // TODO: Display the appropiate details
    displayMessage(`Please sign details on device.`);
    // Adding credential on a new account
    const expiry = getDefaultExpiry();
    const path = getAccountPath({
        identityIndex: identity.id,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });
    const signature = await ledger.signCredentialDeploymentOnNewAccount(
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
        const output = parse(credentialDeploymentInfoString);

        return {
            credentialDeploymentInfoHex: output.hex,
            accountAddress: output.address,
            credentialDeploymentInfo: output.credInfo,
            transactionId: output.hash,
        };
    } catch (e) {
        throw new Error(
            `Unable to create signed credential due to unexpected output: ${credentialDeploymentInfoString}`
        );
    }
}

/**
 * Given a list of encrypted Amounts, and the original credential's number, and nesessary details
 * returns a list of the given amount, decrypted.

 */
export async function decryptAmounts(
    encryptedAmounts: string[],
    credentialNumber: number,
    global: Global,
    prfKey: string
): Promise<string[]> {
    const input = {
        global,
        credentialNumber,
        prfKey,
        encryptedAmounts,
    };

    const decryptedAmounts = await worker.postMessage({
        command: workerCommands.decryptAmounts,
        input: JSON.stringify(input),
    });
    return JSON.parse(decryptedAmounts);
}

export async function makeTransferToPublicData(
    amount: string,
    prfKey: string,
    global: Global,
    accountEncryptedAmount: AccountEncryptedAmount,
    accountNumber: number
) {
    const input = {
        global,
        amount,
        prfKey,
        accountNumber,
        incomingAmounts: accountEncryptedAmount.incomingAmounts,
        encryptedSelfAmount: accountEncryptedAmount.selfAmount,
        aggIndex:
            accountEncryptedAmount.startIndex +
            accountEncryptedAmount.incomingAmounts.length,
    };

    const transferToPublicData = await worker.postMessage({
        command: workerCommands.createTransferToPublicData,
        input: JSON.stringify(input),
    });
    return JSON.parse(transferToPublicData);
}

export async function createGenesisAccount(
    ledger: ConcordiumLedgerClient,
    identityId: number,
    credentialNumber: number,
    ipInfo: Versioned<IpInfo>,
    arInfo: Versioned<ArInfo>,
    global: Versioned<Global>,
    createdAt: string,
    displayMessage: (message: string) => void
): Promise<GenesisCredential> {
    const path = getAccountPath({
        identityIndex: identityId,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identityId
    );
    displayMessage('Please confirm exporting public key on device');
    const publicKey = await ledger.getPublicKey(path);
    displayMessage('Please wait');

    const context = {
        ipInfo: ipInfo.value,
        arInfo: arInfo.value,
        global: global.value,
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: publicKey.toString('hex'),
            },
        ],
        threshold: 1,
        currentYearMonth: createdAt,
        credentialNumber,
    };

    const contextString = JSON.stringify(context);

    const credential = await worker.postMessage({
        command: workerCommands.createGenesisAccount,
        context: contextString,
        idCredSec,
        prfKey,
    });

    return JSON.parse(credential);
}
