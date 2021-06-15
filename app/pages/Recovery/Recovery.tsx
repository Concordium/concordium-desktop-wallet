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
import { addExternalAccount } from '~/features/AccountSlice';
import { insertNewCredential } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import {
    Dispatch,
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
        console.log(accountInfo);
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
    dispatch: Dispatch,
    credId: string,
    blockHash: string,
    credentialNumber: number,
    identityId: number
) {
    const accountInfo = await getAccountInfo(credId, blockHash);

    if (!accountInfo) {
        return false;
    }

    const firstCredential = accountInfo.accountCredentials[0].value.contents;
    const address = await getAddressFromCredentialId(
        firstCredential.regId || firstCredential.credId
    );

    const accountExists = (await findAccounts({ address })).length > 0;
    if (!accountExists) {
        addExternalAccount(
            dispatch,
            address,
            address.substr(0, 8),
            identityId,
            1
        );
    }

    const [credentialIndex, credential] = getCredentialOnChain(
        credId,
        accountInfo
    );

    if (!credential.credId) {
        credential.credId = credential.regId || '';
    }

    insertNewCredential(
        dispatch,
        address,
        credentialNumber,
        identityId,
        credentialIndex,
        credential
    );

    return true;
}

async function recoverAccounts(
    dispatch: Dispatch,
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global,
    allowedSpaces = 10
) {
    let recovered = true;
    let credNumber = 0;
    let skipsRemaining = allowedSpaces;
    while (skipsRemaining >= 0 && credNumber < maxCredentialsOnAccount) {
        const credId = await getCredId(prfKeySeed, credNumber, global);
        recovered = await recoverCredential(
            dispatch,
            credId,
            blockHash,
            credNumber,
            identityId
        );
        credNumber += 1;
        if (!recovered) {
            skipsRemaining -= 1;
        }
    }

    return credNumber > 1;
}

async function recoverIdentity(
    dispatch: Dispatch,
    prfKeySeed: string,
    identityId: number,
    blockHash: string,
    global: Global
) {
    const recovered = await recoverAccounts(
        dispatch,
        prfKeySeed,
        identityId,
        blockHash,
        global
    );

    if (!recovered) {
        removeIdentity(identityId);
    }

    return recovered;
}

/**
 * The default page loaded on the base path. Always
 * forwards directly to the home page.
 */
export default function DefaultPage() {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const [error, setError] = useState<string>();

    async function createAccount(
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
                dispatch,
                prfKeySeed.toString('hex'),
                identityId,
                blockHash,
                global
            );
        }

        loadIdentities(dispatch);
    }

    return (
        <div className="flex">
            <SimpleErrorModal
                header="Unable to recover credentials"
                content={error}
                show={Boolean(error)}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <Card className="marginCenter flexColumn">
                <Ledger ledgerCallback={createAccount}>
                    {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                        <>
                            {statusView}
                            <Button onClick={submitHandler} disabled={!isReady}>
                                Submit
                            </Button>
                        </>
                    )}
                </Ledger>
            </Card>
        </div>
    );
}
