import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { createGenesisAccount } from '~/utils/rustInterface';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import styles from './GenesisAccount.module.scss';
import { GenesisCredential } from '~/utils/types';

interface Props {
    identityId: number;
    setCredentialNumber: (c: number) => void;
    setGenesis: (g: GenesisCredential) => void;
    onFinish: () => void;
    context?: string;
}

export default function CreateCredential({
    identityId,
    setCredentialNumber,
    setGenesis,
    onFinish,
    context,
}: Props) {
    async function createAccount(
        ledger: ConcordiumLedgerClient,
        displayMessage: (message: string) => void
    ) {
        const nextCredentialNumber = await getNextCredentialNumber(identityId);
        if (!context) {
            throw new Error('missing context');
        }

        const { ipInfo, arInfo, global } = JSON.parse(context);
        const createdAt = getCurrentYearMonth();

        setGenesis(
            await createGenesisAccount(
                ledger,
                identityId,
                nextCredentialNumber,
                ipInfo,
                arInfo,
                global,
                createdAt,
                displayMessage
            )
        );
        setCredentialNumber(nextCredentialNumber);
        onFinish();
    }

    return (
        <div className={styles.genesisContainer}>
            <SimpleLedger ledgerCall={createAccount} />
        </div>
    );
}
