import { getAccountInfo } from '~/node/nodeRequests';
import { getAddressFromCredentialId, getCredId } from '~/utils/rustInterface';
import { findAccounts } from '~/database/AccountDao';
import { createAccount, importAccount } from '~/features/AccountSlice';
import {
    createNewCredential,
    importCredentials,
} from '~/features/CredentialSlice';
import {
    Account,
    AccountStatus,
    AccountInfo,
    Global,
    CredentialDeploymentInformation,
    IdentityStatus,
} from '~/utils/types';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import { insertIdentity } from '~/database/IdentityDao';
import {
    maxCredentialsOnAccount,
    allowedSpacesCredentials,
} from '~/constants/recoveryConstants.json';

export function getLostIdentityName(identityNumber: number) {
    return `Lost Identity - ${identityNumber}`;
}

/**
 * Creates a genesis identity for the given wallet if one does not already exist.
 * @param walletId the wallet connected when creating the genesis account
 * @returns the id of the created identity, or the id of the already existing identity
 */
export async function createLostIdentity(
    walletId: number,
    identityNumber: number
): Promise<number> {
    const createdAt = getCurrentYearMonth();
    const validTo = getCurrentYearMonth();
    const identityObject = {
        v: 0,
        value: {
            attributeList: {
                chosenAttributes: {},
                createdAt,
                validTo,
            },
        },
    };

    const identity = {
        name: getLostIdentityName(identityNumber),
        identityNumber,
        identityObject: JSON.stringify(identityObject),
        status: IdentityStatus.Placeholder,
        detail: '',
        codeUri: '',
        identityProvider: '{}',
        randomness: '',
        walletId,
    };

    return (await insertIdentity(identity))[0];
}

function getCredentialOnChain(
    credId: string,
    accountInfo: AccountInfo
): [
    number | undefined,
    Pick<CredentialDeploymentInformation, 'credId' | 'policy' | 'regId'>
] {
    const credentialOnChain = Object.entries(
        accountInfo.accountCredentials
    ).find(
        ([, cred]) =>
            (cred.value.contents.credId || cred.value.contents.regId) === credId
    );
    if (!credentialOnChain) {
        return [
            undefined,
            {
                credId,
                policy: {
                    validTo: getCurrentYearMonth(),
                    createdAt: getCurrentYearMonth(),
                    revealedAttributes: {},
                },
            },
        ];
    }

    return [
        parseInt(credentialOnChain[0], 10),
        credentialOnChain[1].value.contents,
    ];
}

async function recoverCredential(
    credId: string,
    blockHash: string,
    credentialNumber: number,
    identityId: number
) {
    const accountInfo = await getAccountInfo(credId, blockHash);

    if (!accountInfo) {
        return undefined;
    }

    const firstCredential = accountInfo.accountCredentials[0].value.contents;
    const address = await getAddressFromCredentialId(
        firstCredential.regId || firstCredential.credId
    );

    const [credentialIndex, credentialDeploymentInfo] = getCredentialOnChain(
        credId,
        accountInfo
    );

    if (!credentialDeploymentInfo.credId) {
        credentialDeploymentInfo.credId = credentialDeploymentInfo.regId || '';
    }

    const account = createAccount(
        identityId,
        address,
        undefined,
        accountInfo.accountThreshold,
        AccountStatus.Confirmed,
        credentialNumber === 0
    );

    const credential = createNewCredential(
        address,
        credentialNumber,
        identityId,
        credentialIndex,
        credentialDeploymentInfo.credId,
        credentialDeploymentInfo.policy
    );

    return { account, credential };
}

export async function recoverCredentials(
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global,
    startingCredNumber = 0,
    allowedSpaces = allowedSpacesCredentials
) {
    const credentials = [];
    const accounts = [];
    let credNumber = startingCredNumber;
    let skipsRemaining = allowedSpaces;
    while (skipsRemaining >= 0 && credNumber < maxCredentialsOnAccount) {
        const credId = await getCredId(prfKeySeed, credNumber, global);

        const recovered = await recoverCredential(
            credId,
            blockHash,
            credNumber,
            identityId
        );

        if (!recovered) {
            if (credNumber === 0) {
                // If the first credential does not exist, then this index has not been used to create an identity
                break;
            }
            skipsRemaining -= 1;
        } else {
            skipsRemaining = allowedSpaces;
            credentials.push(recovered.credential);
            accounts.push(recovered.account);
        }
        credNumber += 1;
    }

    return { credentials, accounts };
}

export async function addAccounts(accounts: Account[]) {
    for (const account of accounts) {
        const { address } = account;
        const accountExists = (await findAccounts({ address })).length > 0;
        if (!accountExists) {
            importAccount(account);
        }
    }
}

export async function recoverFromIdentity(
    prfKeySeed: string,
    blockHash: string,
    global: Global,
    identityId: number,
    nextCredentialNumber: number
) {
    const { credentials, accounts } = await recoverCredentials(
        prfKeySeed,
        identityId,
        blockHash,
        global,
        nextCredentialNumber
    );

    if (accounts.length > 0) {
        await addAccounts(accounts);
    }

    if (credentials.length > 0) {
        await importCredentials(credentials);
    }
    return credentials.length;
}
