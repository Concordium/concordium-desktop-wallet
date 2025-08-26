import PromiseWorker from 'promise-worker';
import { AccountEncryptedAmount, TransactionExpiry } from '@concordium/web-sdk';

import {
    createCredentialDeploymentTransaction,
    CredentialDeploymentTransaction,
    AttributeKey,
} from '@concordium/web-sdk-v6';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error : has no default export.
import RustWorker, { BakerKeyVariants } from './rust.worker';
import {
    PublicInformationForIp,
    ConfirmedIdentity,
    IpInfo,
    ArInfo,
    Versioned,
    CredentialDeploymentInformation,
    Global,
    GenesisAccount,
    SignedIdRequest,
    UnsignedCredentialDeploymentInformation,
    CreationKeys,
    CommitmentsRandomness,
    IdentityVersion,
    BlsKeyTypes,
} from './types';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import workerCommands from '../constants/workerCommands.json';
import { getDefaultExpiry, secondsSinceUnixEpoch } from './timeHelpers';
import { getAccountPath } from '~/features/ledger/Path';
import { stringify } from './JSONHelper';
import CredentialInfoLedgerDetails from '~/components/ledger/CredentialInfoLedgerDetails';
import { throwLoggedError } from './basicHelpers';

const rawWorker = new RustWorker();
const worker = new PromiseWorker(rawWorker);

const identityCreatedUsingDeprecatedKeyGen = (version: IdentityVersion) =>
    version === 0;

/**
 * Returns the PrfKey and IdCredSec for the given identity.
 * identityVersion 0 gives the seeds, and 1 gives the BLS keys.
 */
async function getSecretsFromLedger(
    ledger: ConcordiumLedgerClient,
    displayMessage: (message: string) => void,
    identityNumber: number,
    keyType: BlsKeyTypes
) {
    displayMessage('Please accept to create credential on device');
    const {
        prfKey: prfKeyRaw,
        idCredSec: idCredSecRaw,
    } = await ledger.getPrivateKeys(identityNumber, keyType);

    const prfKey = prfKeyRaw.toString('hex');
    const idCredSec = idCredSecRaw.toString('hex');
    return { prfKey, idCredSec };
}

export async function exportKeysFromLedger(
    identityNumber: number,
    credentialNumber: number,
    displayMessage: (message: string) => void,
    keyType: BlsKeyTypes,
    ledger: ConcordiumLedgerClient
): Promise<CreationKeys> {
    const path = getAccountPath({
        identityIndex: identityNumber,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });
    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identityNumber,
        keyType
    );
    displayMessage(
        `Please confirm exporting
public key on device,
for identity: ${identityNumber}, credential: ${credentialNumber}.`
    );
    const publicKey = (await ledger.getPublicKey(path)).toString('hex');
    displayMessage(`Please confirm exported public key: ${publicKey}`);
    return { prfKey, idCredSec, publicKey };
}

/**
 *  This function creates an IdentityObjectRequest using the ledger, given the nesessary information and the identity number on the ledger.
 * Returns the IdentityObjectRequest and the randomness used to generate it.
 */
export async function createIdentityRequestObjectLedger(
    identityNumber: number,
    keys: CreationKeys,
    ipInfo: IpInfo,
    arsInfos: Record<string, ArInfo>,
    global: Global,
    displayMessage: (message: string | JSX.Element) => void,
    ledger: ConcordiumLedgerClient,
    signDetailsView: (info: PublicInformationForIp) => JSX.Element
): Promise<SignedIdRequest> {
    const context = {
        ipInfo,
        arsInfos,
        global,
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: keys.publicKey,
            },
        ],
        threshold: 1,
    };

    const contextString = JSON.stringify(context);

    const pubInfoForIpString = await worker.postMessage({
        command: workerCommands.buildPublicInformationForIp,
        context: contextString,
        idCredSecSeed: keys.idCredSec,
        prfKeySeed: keys.prfKey,
    });

    const pubInfoForIp: PublicInformationForIp = JSON.parse(pubInfoForIpString);

    const path = {
        identityIndex: identityNumber,
        accountIndex: 0,
        signatureIndex: 0,
    };

    displayMessage(signDetailsView(pubInfoForIp));

    const signature = await ledger.signPublicInformationForIp(
        pubInfoForIp,
        path
    );
    displayMessage('Please wait');
    const dataString = await worker.postMessage({
        command: workerCommands.createIdRequest,
        context: contextString,
        signature: signature.toString('hex'),
        idCredSecSeed: keys.idCredSec,
        prfKeySeed: keys.prfKey,
    });
    const data = JSON.parse(dataString);

    return {
        idObjectRequest: data.idObjectRequest,
        randomness: data.randomness_wrapped.randomness,
    };
}

async function createUnsignedCredentialInfo(
    identity: ConfirmedIdentity,
    credentialNumber: number,
    keys: CreationKeys,
    global: Global,
    attributes: string[],
    address?: string
) {
    const identityProvider = JSON.parse(identity.identityProvider);

    const credentialInput: Record<string, unknown> = {
        ipInfo: identityProvider.ipInfo,
        arsInfos: identityProvider.arsInfos,
        global,
        identityObject: JSON.parse(identity.identityObject).value, // TODO: perhaps do this onload?
        publicKeys: [
            {
                schemeId: 'Ed25519',
                verifyKey: keys.publicKey,
            },
        ],
        threshold: 1,
        credentialNumber,
        revealedAttributes: attributes,
        randomness: {
            randomness: identity.randomness,
        },
    };
    if (address) {
        credentialInput.address = address;
    }

    const unsignedCredentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createUnsignedCredential,
        input: stringify(credentialInput),
        prfKey: keys.prfKey,
        idCredSec: keys.idCredSec,
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identity.version),
    });

    try {
        const { cdi, randomness } = JSON.parse(
            unsignedCredentialDeploymentInfoString
        );
        return {
            cdi: cdi as UnsignedCredentialDeploymentInformation,
            randomness,
        };
    } catch (e) {
        return throwLoggedError(
            `Unable to create unsigned credential due to unexpected output: ${unsignedCredentialDeploymentInfoString}`
        );
    }
}

interface WithRandomness<Info> {
    info: Info;
    randomness: CommitmentsRandomness;
}

/**
 * Used to construct a credential for an existing account.
 *
 * This function creates a CredentialDeploymentInfo using the hardware wallet, using the necessary information
 * and the account number. The hardware wallet is used, as part of the constructed data has to be signed.
 */
export async function createCredentialInfo(
    identity: ConfirmedIdentity,
    credentialNumber: number,
    keys: CreationKeys,
    global: Global,
    attributes: string[],
    displayMessage: (message: string | JSX.Element) => void,
    ledger: ConcordiumLedgerClient,
    address: string
): Promise<WithRandomness<CredentialDeploymentInformation>> {
    const { cdi, randomness } = await createUnsignedCredentialInfo(
        identity,
        credentialNumber,
        keys,
        global,
        attributes,
        address
    );

    displayMessage(CredentialInfoLedgerDetails({ ...cdi, address }));
    // Adding credential on an existing account
    const path = getAccountPath({
        identityIndex: identity.identityNumber,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });
    const signature = await ledger.signCredentialDeploymentOnExistingAccount(
        cdi,
        address,
        path
    );

    const credentialDeploymentInfoString = await worker.postMessage({
        command: workerCommands.createCredentialInfo,
        signature: signature.toString('hex'),
        unsignedInfo: stringify(cdi),
    });

    displayMessage('Please wait');
    return { info: JSON.parse(credentialDeploymentInfoString), randomness };
}

/**
 *  This function creates a CredentialDeploymentInfo using the ledger, given the nesessary information and the account number.
 *  Returns a CredentialDeploymentDetails object, which contains the CredentialDeploymentInfo,
 *  and it's hex, and it's hash (transactionId), and the account address.
 * N.B. This function is to construct a credential for a new account.
 */
export async function createCredentialDetails(
    identity: ConfirmedIdentity,
    credentialNumber: number,
    keys: CreationKeys,
    global: Global,
    attributes: string[],
    displayMessage: (message: string | JSX.Element) => void,
    ledger: ConcordiumLedgerClient
): Promise<{
    transaction: CredentialDeploymentTransaction;
    signatures: string[];
}> {
    const expiry = TransactionExpiry.fromEpochSeconds(
        BigInt(secondsSinceUnixEpoch(getDefaultExpiry()))
    );

    const identityProvider = JSON.parse(identity.identityProvider);
    const transaction = createCredentialDeploymentTransaction(
        {
            identityProvider,
            identityObject: JSON.parse(identity.identityObject).value, // TODO: perhaps do this onload?
            prfKey: keys.prfKey,
            idCredSecret: keys.idCredSec,
            randomness: identity.randomness,
        },
        global,
        1,
        [{ verifyKey: keys.publicKey, schemeId: 'Ed25519' }],
        credentialNumber,
        attributes as AttributeKey[],
        expiry
    );

    displayMessage(CredentialInfoLedgerDetails(transaction.unsignedCdi));
    const path = getAccountPath({
        identityIndex: identity.identityNumber,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });
    const signature = (
        await ledger.signCredentialDeploymentOnNewAccount(
            transaction.unsignedCdi,
            expiry.expiryEpochSeconds,
            path
        )
    ).toString('hex');

    displayMessage('Please wait');

    return { transaction, signatures: [signature] };
}

/**
 * Given a list of encrypted Amounts, and the original credential's number, and nesessary details
 * returns a list of the given amount, decrypted.

 */
export async function decryptAmounts(
    encryptedAmounts: string[],
    credentialNumber: number,
    global: Global,
    prfKey: string,
    identityVersion: IdentityVersion
): Promise<string[]> {
    const input = {
        global,
        credentialNumber,
        encryptedAmounts,
    };
    const decryptedAmounts = await worker.postMessage({
        command: workerCommands.decryptAmounts,
        input: JSON.stringify(input),
        prfKey,
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identityVersion),
    });
    return JSON.parse(decryptedAmounts);
}

export async function makeTransferToPublicData(
    amount: string,
    prfKey: string,
    global: Global,
    accountEncryptedAmount: AccountEncryptedAmount,
    accountNumber: number,
    identityVersion: IdentityVersion
) {
    const input = {
        global,
        amount,
        accountNumber,
        incomingAmounts: accountEncryptedAmount.incomingAmounts,
        encryptedSelfAmount: accountEncryptedAmount.selfAmount,
        aggIndex: (
            accountEncryptedAmount.startIndex +
            BigInt(accountEncryptedAmount.incomingAmounts.length)
        ).toString(),
    };

    const transferToPublicData = await worker.postMessage({
        command: workerCommands.createTransferToPublicData,
        input: JSON.stringify(input),
        prfKey,
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identityVersion),
    });
    return JSON.parse(transferToPublicData);
}

export async function makeTransferToEncryptedData(
    amount: string,
    prfKey: string,
    global: Global,
    accountEncryptedAmount: AccountEncryptedAmount,
    accountNumber: number,
    identityVersion: IdentityVersion
) {
    const input = {
        global,
        amount,
        accountNumber,
        incomingAmounts: accountEncryptedAmount.incomingAmounts,
        encryptedSelfAmount: accountEncryptedAmount.selfAmount,
    };

    const transferToSecretData = await worker.postMessage({
        command: workerCommands.createTransferToEncryptedData,
        input: JSON.stringify(input),
        prfKey,
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identityVersion),
    });
    return JSON.parse(transferToSecretData);
}

export async function makeEncryptedTransferData(
    amount: string,
    receiverPublicKey: string,
    prfKey: string,
    global: Global,
    accountEncryptedAmount: AccountEncryptedAmount,
    accountNumber: number,
    identityVersion: IdentityVersion
) {
    const input = {
        global,
        amount,
        receiverPublicKey,
        accountNumber,
        incomingAmounts: accountEncryptedAmount.incomingAmounts,
        encryptedSelfAmount: accountEncryptedAmount.selfAmount,
        aggIndex: (
            accountEncryptedAmount.startIndex +
            BigInt(accountEncryptedAmount.incomingAmounts.length)
        ).toString(),
    };

    const encryptedTransferData = await worker.postMessage({
        command: workerCommands.createEncryptedTransferData,
        input: JSON.stringify(input),
        prfKey,
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identityVersion),
    });
    return JSON.parse(encryptedTransferData);
}

export async function createGenesisAccount(
    ledger: ConcordiumLedgerClient,
    identityNumber: number,
    credentialNumber: number,
    ipInfo: Versioned<IpInfo>,
    arInfo: Versioned<ArInfo>,
    global: Versioned<Global>,
    createdAt: string,
    displayMessage: (message: string) => void
): Promise<GenesisAccount> {
    const path = getAccountPath({
        identityIndex: identityNumber,
        accountIndex: credentialNumber,
        signatureIndex: 0,
    });

    const { prfKey, idCredSec } = await getSecretsFromLedger(
        ledger,
        displayMessage,
        identityNumber,
        BlsKeyTypes.Key
    );
    displayMessage('Please confirm exporting public-key on device');
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

export type BakerKeys = {
    electionSecret: string;
    electionPublic: string;
    signatureSecret: string;
    signaturePublic: string;
    aggregationSecret: string;
    aggregationPublic: string;
    proofElection: string;
    proofSignature: string;
    proofAggregation: string;
};

export async function generateBakerKeys(
    sender: string,
    keyVariant: BakerKeyVariants
): Promise<BakerKeys> {
    const response = await worker.postMessage({
        command: workerCommands.generateBakerKeys,
        sender,
        keyVariant,
    });
    return JSON.parse(response);
}

export function getAddressFromCredentialId(credId: string): Promise<string> {
    return worker.postMessage({
        command: workerCommands.getAddressFromCredId,
        credId,
    });
}

export function computeCredIdFromSeed(
    prfKeySeed: string,
    credentialNumber: number,
    global: Global,
    identityVersion: IdentityVersion
): Promise<string> {
    return worker.postMessage({
        command: workerCommands.getCredId,
        prfKey: prfKeySeed,
        credentialNumber,
        global: stringify(global),
        useDeprecated: identityCreatedUsingDeprecatedKeyGen(identityVersion),
    });
}
