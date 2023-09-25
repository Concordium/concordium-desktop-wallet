import {
    getAddressFromCredentialId,
    computeCredIdFromSeed,
} from '~/utils/rustInterface';
import {
    insertFromRecoveryExistingIdentity,
    insertFromRecoveryNewIdentity,
} from '~/database/AccountDao';
import { createNewCredential, getCredId } from '~/utils/credentialHelper';
import {
    AccountStatus,
    AccountInfo,
    Global,
    IdentityStatus,
    Policy,
    IdentityObject,
    Versioned,
    AccountAndCredentialPairs,
    Identity,
    IdentityVersion,
} from '~/utils/types';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import recoveryConstants from '~/constants/recoveryConstants.json';
import { createAccount } from '~/utils/accountHelpers';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import AbortController from '~/utils/AbortController';
import { getAccountInfoOfCredential } from '~/node/nodeRequests';

export enum Status {
    Initial = 'Waiting...',
    WaitingForInput = 'Waiting for Ledger input.',
    Searching = 'Looking for accounts...',
}

export function getRecoveredIdentityName(identityNumber: number) {
    return `Recovered: Index ${identityNumber}`;
}

/**
 * Creates an placeholder identity,
 * @param walletId the wallet on which the identity is created.
 * @param identityNumber the identity's number on the wallet.
 * @param identityVersion the version, which the identity's PRF key and IdCredSec were generated with.
 * @returns the id of the created identity.
 */
export async function createRecoveredIdentity(
    walletId: number,
    identityNumber: number,
    identityVersion: IdentityVersion
): Promise<Omit<Identity, 'id'>> {
    const createdAt = getCurrentYearMonth();
    const validTo = getCurrentYearMonth();
    const identityObject: Versioned<IdentityObject> = {
        v: 0,
        value: {
            attributeList: {
                chosenAttributes: {
                    firstName: '',
                    lastName: '',
                    sex: '',
                    dob: '',
                    countryOfResidence: '',
                    nationality: '',
                    idDocType: '',
                    idDocNo: '',
                    idDocIssuer: '',
                    idDocIssuedAt: '',
                    idDocExpiresAt: '',
                    nationalIdNo: '',
                    taxIdNo: '',
                },
                maxAccounts: 0,
                createdAt,
                validTo,
            },
        },
    };

    const identity = {
        name: getRecoveredIdentityName(identityNumber),
        identityNumber,
        identityObject: JSON.stringify(identityObject),
        status: IdentityStatus.Recovered,
        detail: '',
        codeUri: '',
        identityProvider: '{}',
        randomness: '',
        walletId,
        version: identityVersion,
    };

    return identity;
}

interface CredentialIndexAndPolicy {
    credentialIndex?: number;
    policy: Policy;
}

/**
 * Given a credId, and accountInfo, extract the credential corresponding to the credId.
 * N.B. If the credId is not in the accountInfo, we assume that it has been removed, and return it with undefined as credentialIndex and a faked policy.
 * @returns a CredentialIndexAndPolicy object. CredentialIndex is undefined if the credential is not in the accountInfo.
 */
function extractCredentialIndexAndPolicy(
    credId: string,
    accountInfo: AccountInfo
): CredentialIndexAndPolicy {
    const credentialOnChain = Object.entries(
        accountInfo.accountCredentials
    ).find(([, cred]) => getCredId(cred) === credId);

    if (!credentialOnChain) {
        return {
            credentialIndex: undefined,
            policy: {
                validTo: getCurrentYearMonth(),
                createdAt: getCurrentYearMonth(),
                revealedAttributes: {},
            },
        };
    }

    return {
        credentialIndex: parseInt(credentialOnChain[0], 10),
        policy: credentialOnChain[1].value.contents.policy,
    };
}

/**
 * Attempts to recover the credential with the given credId.
 * If the credential has been deployed, we add it to the database.
 * @param credId credId of the credential, which is to be recovered
 * @param blockHash block at which the function will look up the account info
 * @param credentialNumber credential number of the credential on its identity
 * @param identityId id of the credential's identity
 * @returns If the credential has existed on chain, returns an object containing the credential and its accounts. If it never existed, returns undefined.
 */
async function recoverCredential(
    credId: string,
    blockHash: string,
    credentialNumber: number,
    identityId: number
) {
    let accountInfo: AccountInfo;
    try {
        accountInfo = await getAccountInfoOfCredential(credId, blockHash);
    } catch {
        // The presence of an accountInfo implies that the credential has been deployed.
        // if it is not present, the credential has not been deployed, and we don't need to save anything.
        return undefined;
    }

    const firstCredential = accountInfo.accountCredentials[0];
    const firstCredId = getCredId(firstCredential);
    const address = await getAddressFromCredentialId(firstCredId);

    const { credentialIndex, policy } = extractCredentialIndexAndPolicy(
        credId,
        accountInfo
    );

    const account = createAccount(
        identityId,
        address,
        AccountStatus.Confirmed,
        undefined,
        accountInfo.accountThreshold,
        credentialNumber === 0
    );

    // Because The credential has been deployed, we must add the credential to the database, to indicate that the index has been used.
    const credential = createNewCredential(
        address,
        credentialNumber,
        identityId,
        credentialIndex,
        credId,
        policy
    );

    return { account, credential };
}

/**
 * Attempts to recover credentials on an existing identity.
 * @param prfKeySeed Seed of the prfKey of the identity.
 * @param identityId id of the identity.
 * @param blockHash block at which the function recover credentials.
 * @param global current global parameters.
 * @param controller used to check if the flow has been interrupted.
 * @param startingCredNumber credentialNumber, from which to start attempting to recover credentials from.
 * @returns Returns a list of all recovered credentials and their accounts in pairs. (if Interrupted, the list is empty)
 */
export async function recoverCredentials(
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global,
    identityVersion: IdentityVersion,
    controller: AbortController,
    startingCredNumber = 0
): Promise<AccountAndCredentialPairs> {
    const allRecovered = [];
    let credNumber = startingCredNumber;
    while (credNumber < recoveryConstants.maxCredentialsOnIdentity) {
        const credId = await computeCredIdFromSeed(
            prfKeySeed,
            credNumber,
            global,
            identityVersion
        );

        const recovered = await recoverCredential(
            credId,
            blockHash,
            credNumber,
            identityId
        );

        if (controller.isAborted) {
            return [];
        }

        if (recovered) {
            allRecovered.push(recovered);
        }
        credNumber += 1;
    }

    return allRecovered;
}

/**
 * Attempts to recover credentials on an identity.
 * @param prfKeySeed Seed of the prfKey of the identity.
 * @param blockHash block at which the function recover credentials.
 * @param global current global parameters.
 * @param identityId id of the identity.
 * @param controller used to check if the flow has been interrupted.
 * @returns Returns the recovered accounts.
 */
export async function recoverFromIdentity(
    prfKeySeed: string,
    blockHash: string,
    global: Global,
    identityId: number,
    identityVersion: IdentityVersion,
    controller: AbortController
) {
    const nextCredentialNumber = await getNextCredentialNumber(identityId);
    const recovered = await recoverCredentials(
        prfKeySeed,
        identityId,
        blockHash,
        global,
        identityVersion,
        controller,
        nextCredentialNumber
    );

    if (recovered.length > 0 && !controller.isAborted) {
        await insertFromRecoveryExistingIdentity(recovered);
    }
    return recovered.map(({ account }) => account);
}

/**
 * Attempts to recover credentials on an unused identityNumber.
 * @param prfKeySeed Seed of the prfKey of the identity.
 * @param blockHash block at which the function recover credentials.
 * @param global current global parameters.
 * @param identityNumber identityNumber of the current wallet to recover from.
 * @param walletId id of the wallet to recover from.
 * @param controller used to check if the flow has been interrupted.
 * @returns Returns the recovered accounts.
 */
export async function recoverNewIdentity(
    prfKeySeed: string,
    blockHash: string,
    global: Global,
    identityNumber: number,
    walletId: number,
    identityVersion: IdentityVersion,
    controller: AbortController
) {
    const recovered = await recoverCredentials(
        prfKeySeed,
        0,
        blockHash,
        global,
        identityVersion,
        controller
    );

    // If we have recovered credentials and accounts, create an identity and add the credentials and accounts.
    if (recovered.length && !controller.isAborted) {
        const identity = await createRecoveredIdentity(
            walletId,
            identityNumber,
            identityVersion
        );
        if (recovered.length > 0) {
            await insertFromRecoveryNewIdentity(recovered, identity);
        }
    }
    return recovered.map(({ account }) => account);
}
