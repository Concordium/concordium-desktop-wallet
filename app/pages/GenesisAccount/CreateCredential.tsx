import React from 'react';
import { useDispatch } from 'react-redux';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { createGenesisAccount } from '~/utils/rustInterface';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import styles from './GenesisAccount.module.scss';
import { GenesisAccount, IdentityStatus } from '~/utils/types';
import Ledger from '~/components/ledger/Ledger';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import { asyncNoOp } from '~/utils/basicHelpers';
import pairWallet from '~/utils/WalletPairing';
import getIdentityDao, { getAllIdentities } from '~/database/IdentityDao';

interface Props {
    setGenesisAccount: (g: GenesisAccount) => void;
    onFinish: (credentialNumber: number, identityId: number) => void;
    context?: string;
}

// The identity number of all genesis identities
// is 0, as there will be at most 1 per (hardware) wallet.
const identityNumber = 0;

/**
 * Creates a genesis identity for the given wallet if one does not already exist.
 * @param walletId the wallet connected when creating the genesis account
 * @returns the id of the created identity, or the id of the already existing identity
 */
async function createGenesisIdentity(walletId: number): Promise<number> {
    const existingIdentities = await getIdentityDao().getIdentitiesForWallet(
        walletId
    );
    if (existingIdentities.length === 1) {
        return existingIdentities[0].id;
    }
    if (existingIdentities.length > 1) {
        throw new Error(
            'Multiple identities have been created with the same wallet prior to genesis.'
        );
    }

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

    const identityCount = (await getAllIdentities()).length;
    const identity = {
        name: `Genesis #${identityCount}`,
        identityNumber,
        identityObject: JSON.stringify(identityObject),
        status: IdentityStatus.Genesis,
        detail: '',
        codeUri: '',
        identityProvider: '{}',
        randomness: '',
        walletId,
    };

    return (await getIdentityDao().insert(identity))[0];
}

export default function CreateCredential({
    setGenesisAccount,
    onFinish,
    context,
}: Props) {
    const dispatch = useDispatch();

    async function createAccount(
        ledger: ConcordiumLedgerClient,
        displayMessage: (message: string) => void
    ) {
        if (!context) {
            throw new Error('Missing context.');
        }

        const walletId = await pairWallet(ledger, dispatch);
        const identityId = await createGenesisIdentity(walletId);
        const nextCredentialNumber = await getNextCredentialNumber(identityId);
        const { ipInfo, arInfo, global } = JSON.parse(context);
        const createdAt = getCurrentYearMonth();

        setGenesisAccount(
            await createGenesisAccount(
                ledger,
                identityNumber,
                nextCredentialNumber,
                ipInfo,
                arInfo,
                global,
                createdAt,
                displayMessage
            )
        );
        onFinish(nextCredentialNumber, identityId);
    }

    return (
        <Card className={styles.ledgerCard}>
            <Ledger ledgerCallback={createAccount}>
                {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                    <>
                        {statusView}
                        <Button
                            className={styles.ledgerButton}
                            onClick={submitHandler}
                            disabled={!isReady}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </Ledger>
        </Card>
    );
}
