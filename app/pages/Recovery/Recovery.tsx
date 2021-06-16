import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import Ledger from '~/components/ledger/Ledger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { asyncNoOp } from '~/utils/basicHelpers';
import { getConsensusStatus, getAccountInfo } from '~/node/nodeRequests';
import { getAddressFromCredentialId, getCredId } from '~/utils/rustInterface';
import { findAccounts } from '~/database/AccountDao';
import {
    createAccount,
    importAccount,
    loadAccounts,
} from '~/features/AccountSlice';
import {
    loadCredentials,
    createNewCredential,
    importCredentials,
} from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import {
    Account,
    AccountStatus,
    AccountInfo,
    Global,
    CredentialDeploymentInformation,
    IdentityStatus,
} from '~/utils/types';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import {
    getNextIdentityNumber,
    insertIdentity,
    removeIdentity,
} from '~/database/IdentityDao';
import pairWallet from '~/utils/WalletPairing';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import errorMessages from '~/constants/errorMessages.json';
import PageLayout from '~/components/PageLayout';
import styles from './Recovery.module.scss';

const maxCredentialsOnAccount = 200;

/**
 * Creates a genesis identity for the given wallet if one does not already exist.
 * @param walletId the wallet connected when creating the genesis account
 * @returns the id of the created identity, or the id of the already existing identity
 */
async function createLostIdentity(
    walletId: number,
    identityNumber: number
): Promise<number> {
    const createdAt = getCurrentYearMonth();
    // ValidTo is set to be 5 years after the created at date.
    const validTo = (parseInt(createdAt, 10) + 500).toString();
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
        name: `Lost Identity - ${identityNumber}`,
        identityNumber,
        identityObject: JSON.stringify(identityObject),
        status: IdentityStatus.Genesis,
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
        address.substr(0, 8),
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

async function recoverCredentials(
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global,
    allowedSpaces = 10
) {
    const credentials = [];
    const accounts = [];
    let credNumber = 0;
    let skipsRemaining = allowedSpaces;
    while (skipsRemaining >= 0 && credNumber < maxCredentialsOnAccount) {
        const credId = await getCredId(prfKeySeed, credNumber, global);

        const recovered = await recoverCredential(
            credId,
            blockHash,
            credNumber,
            identityId
        );
        credNumber += 1;
        if (!recovered) {
            skipsRemaining -= 1;
        } else {
            credentials.push(recovered.credential);
            accounts.push(recovered.account);
        }
    }

    return { credentials, accounts };
}

async function addAccounts(accounts: Account[]) {
    for (const account of accounts) {
        const { address } = account;
        const accountExists = (await findAccounts({ address })).length > 0;
        if (!accountExists) {
            importAccount(account);
        }
    }
}

async function recoverIdentity(
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global
) {
    const { credentials, accounts } = await recoverCredentials(
        prfKeySeed,
        identityId,
        blockHash,
        global
    );

    const exists = credentials.length > 0;

    if (exists) {
        await addAccounts(accounts);
        await importCredentials(credentials);
    } else {
        await removeIdentity(identityId);
    }
    return exists;
}

/**
 * The default page loaded on the base path. Always
 * forwards directly to the home page.
 */
export default function DefaultPage() {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const [error, setError] = useState<string>();

    async function performRecovery(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            setError(errorMessages.missingGlobal);
            return;
        }
        const consensusStatus = await getConsensusStatus();
        const blockHash = consensusStatus.lastFinalizedBlock;

        const walletId = await pairWallet(ledger, dispatch);

        let recovered = true;
        while (recovered) {
            const identityNumber = await getNextIdentityNumber(walletId);
            const identityId = await createLostIdentity(
                walletId,
                identityNumber
            );
            setMessage('Please confirm export of PRF key');
            const prfKeySeed = await ledger.getPrfKey(identityNumber);
            setMessage('Recovering credentials');
            recovered = await recoverIdentity(
                prfKeySeed.toString('hex'),
                identityId,
                blockHash,
                global
            );
        }

        loadAccounts(dispatch);
        loadCredentials(dispatch);
        loadIdentities(dispatch);
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Recovery</h1>
            </PageLayout.Header>
            <PageLayout.Container
                closeRoute={routes.IDENTITIES}
                disableBack
                padding="vertical"
                className="flex"
            >
                <SimpleErrorModal
                    header="Unable to recover credentials"
                    content={error}
                    show={Boolean(error)}
                    onClick={() => dispatch(push(routes.IDENTITIES))}
                />
                <Card className={styles.card}>
                    <Ledger ledgerCallback={performRecovery}>
                        {({
                            isReady,
                            statusView,
                            submitHandler = asyncNoOp,
                        }) => (
                            <>
                                {statusView}
                                <Button
                                    onClick={submitHandler}
                                    disabled={!isReady}
                                >
                                    Submit
                                </Button>
                            </>
                        )}
                    </Ledger>
                </Card>
            </PageLayout.Container>
        </PageLayout>
    );
}
