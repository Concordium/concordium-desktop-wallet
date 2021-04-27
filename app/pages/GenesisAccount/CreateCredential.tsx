import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { createGenesisAccount } from '~/utils/rustInterface';
import { getCurrentYearMonth } from '~/utils/timeHelpers';
import styles from './GenesisAccount.module.scss';
import { GenesisAccount } from '~/utils/types';
import Ledger from '~/components/ledger/Ledger';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import { asyncNoOp } from '~/utils/basicHelpers';

interface Props {
    identityId: number;
    setCredentialNumber: (c: number) => void;
    setGenesisAccount: (g: GenesisAccount) => void;
    onFinish: () => void;
    context?: string;
}

export default function CreateCredential({
    identityId,
    setCredentialNumber,
    setGenesisAccount,
    onFinish,
    context,
}: Props) {
    async function createAccount(
        ledger: ConcordiumLedgerClient,
        displayMessage: (message: string) => void
    ) {
        if (!context) {
            throw new Error('missing context');
        }
        const nextCredentialNumber = await getNextCredentialNumber(identityId);
        const { ipInfo, arInfo, global } = JSON.parse(context);
        const createdAt = getCurrentYearMonth();

        setGenesisAccount(
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
