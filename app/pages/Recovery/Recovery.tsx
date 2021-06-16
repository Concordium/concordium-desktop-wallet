import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import Ledger from '~/components/ledger/Ledger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { asyncNoOp } from '~/utils/basicHelpers';
import { getConsensusStatus } from '~/node/nodeRequests';
import { loadAccounts } from '~/features/AccountSlice';
import { loadCredentials } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { loadIdentities, identitiesSelector } from '~/features/IdentitySlice';
import { getNextIdentityNumber } from '~/database/IdentityDao';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import pairWallet from '~/utils/WalletPairing';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import errorMessages from '~/constants/errorMessages.json';
import PageLayout from '~/components/PageLayout';
import styles from './Recovery.module.scss';
import { createLostIdentity, recoverIdentity } from './util';

const addedMessage = (identityName: string, count: number) =>
    `Recovered ${count} credentials on ${identityName}`;
const newIdentityMessage = (identityNumber: number, count: number) =>
    `Recovered ${count} credentials on lost identity - ${identityNumber}`;
const noIdentityMessage = (identityNumber: number) =>
    `There is no Identity with number ${identityNumber} on the chain`;

/**
 * The default page loaded on the base path. Always
 * forwards directly to the home page.
 */
export default function DefaultPage() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const global = useSelector(globalSelector);
    const [error, setError] = useState<string>();
    const [messages, setMessages] = useState<string[]>([]);

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

        // Check for accounts on current identities
        for (const identity of identities) {
            if (identity.walletId === walletId) {
                setMessage('Please confirm export of PRF key');
                const prfKeySeed = await ledger.getPrfKey(
                    identity.identityNumber
                );
                setMessage('Recovering credentials');

                const added = await recoverIdentity(
                    prfKeySeed.toString('hex'),
                    identity.id,
                    blockHash,
                    global,
                    await getNextCredentialNumber(identity.id)
                );
                setMessages((ms) => [
                    ...ms,
                    addedMessage(identity.name, added),
                ]);
            }
        }

        // Check next identities
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
            const addedCount = await recoverIdentity(
                prfKeySeed.toString('hex'),
                identityId,
                blockHash,
                global
            );
            if (addedCount) {
                setMessages((ms) => [
                    ...ms,
                    newIdentityMessage(identityNumber, addedCount),
                ]);
            } else {
                setMessages((ms) => [...ms, noIdentityMessage(identityNumber)]);
            }
            recovered = Boolean(addedCount);
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
                <div className={styles.messages}>
                    <h3>Messages:</h3>
                    {messages.map((m) => (
                        <>
                            <p>{m}</p>
                        </>
                    ))}
                </div>
            </PageLayout.Container>
        </PageLayout>
    );
}
