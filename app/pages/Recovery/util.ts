import { getAccountInfo } from '~/node/nodeRequests';
import { getAddressFromCredentialId, getCredId } from '~/utils/rustInterface';
import {
    findAccounts,
    insertAccountAndCredential,
} from '~/database/AccountDao';
import { createNewCredential } from '~/utils/credentialHelper';
import { importCredentials } from '~/features/CredentialSlice';
import {
    Account,
    AccountStatus,
    AccountInfo,
    Global,
    IdentityStatus,
    Policy,
    IdentityObject,
    Versioned,
    Credential,
} from '~/utils/types';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import { insertIdentity } from '~/database/IdentityDao';
import { maxCredentialsOnAccount } from '~/constants/recoveryConstants.json';
import { createAccount } from '~/utils/accountHelpers';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import AbortController from '~/utils/AbortController';

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
 * @returns the id of the created identity.
 */
export async function createRecoveredIdentity(
    walletId: number,
    identityNumber: number
): Promise<number> {
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
    };

    return (await insertIdentity(identity))[0];
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
    ).find(
        ([, cred]) =>
            (cred.value.contents.credId || cred.value.contents.regId) === credId
    );

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
    const accountInfo = await getAccountInfo(credId, blockHash);

    // The presence of an accountInfo implies that the credential has been deployed.
    // if it is not present, the credential has not been deployed, and we don't need to save anything.
    if (!accountInfo) {
        return undefined;
    }

    const firstCredential = accountInfo.accountCredentials[0].value.contents;
    const address = await getAddressFromCredentialId(
        firstCredential.regId || firstCredential.credId
    );

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

type AccountAndCredentialPairs = {
    account: Account;
    credential: Credential;
}[];

/**
 * Attempts to recover credentials on an existing identity.
 * @param prfKeySeed Seed of the prfKey of the identity.
 * @param identityId id of the identity.
 * @param blockHash block at which the function recover credentials.
 * @param global current global parameters.
 * @param startingCredNumber credentialNumber, from which to start attempting to recover credentials from.
 * @returns Returns an object containing the list of all recovered credentials and their accounts. The length of these lists are always the same, and each account matches the credential on the same index.
 */
export async function recoverCredentials(
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global,
    controller: AbortController,
    startingCredNumber = 0
): Promise<AccountAndCredentialPairs> {
    const allRecovered = [];
    let credNumber = startingCredNumber;
    while (credNumber < maxCredentialsOnAccount) {
        const credId = await getCredId(prfKeySeed, credNumber, global);

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
 * Imports a list of accounts, but only non-duplicates.
 * @param recovered the account and credential pairs to be added.
 * @param addressBook the addressBook is used to check for duplicates.
 * @param identityId optional parameter, which replaces the identityId on accounts and credentials
 */
export async function insertRecovered(
    recovered: AccountAndCredentialPairs,
    identityId?: number
) {
    for (const pair of recovered) {
        let { account, credential } = pair;
        if (identityId !== undefined) {
            account = { ...account, identityId };
            credential = { ...credential, identityId };
        }
        const { address } = account;
        const accountExists = (await findAccounts({ address })).length > 0;
        if (!accountExists) {
            insertAccountAndCredential(
                account,
                credential,
                'Recovered account'
            );
        } else {
            importCredentials([credential]);
        }
    }
}

/**
 * Attempts to recover credentials on an identity.
 * @param prfKeySeed Seed of the prfKey of the identity.
 * @param blockHash block at which the function recover credentials.
 * @param global current global parameters.
 * @param identityId id of the identity.
 * @param addressBook the addressBook is used to check for duplicates when inserting new accounts.
 * @returns Returns the recovered accounts.
 */
export async function recoverFromIdentity(
    prfKeySeed: string,
    blockHash: string,
    global: Global,
    identityId: number,
    controller: AbortController
) {
    const nextCredentialNumber = await getNextCredentialNumber(identityId);
    const recovered = await recoverCredentials(
        prfKeySeed,
        identityId,
        blockHash,
        global,
        controller,
        nextCredentialNumber
    );

    if (recovered.length > 0 && !controller.isAborted) {
        await insertRecovered(recovered);
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
 * @param addressBook the addressBook is used to check for duplicates when inserting new accounts.
 * @returns Returns the recovered accounts.
 */
export async function recoverNewIdentity(
    prfKeySeed: string,
    blockHash: string,
    global: Global,
    identityNumber: number,
    walletId: number,
    controller: AbortController
) {
    const recovered = await recoverCredentials(
        prfKeySeed,
        0,
        blockHash,
        global,
        controller
    );

    // If we have found any credentials, create an identity and add the credentials and accounts.
    // N.B. It is sufficient to check credentials, because accounts are not found without credentials.
    if (recovered.length && !controller.isAborted) {
        const identityId = await createRecoveredIdentity(
            walletId,
            identityNumber
        );
        if (recovered.length > 0) {
            await insertRecovered(recovered, identityId);
        }
    }
    return recovered.map(({ account }) => account);
}
