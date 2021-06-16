import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import Columns from '~/components/Columns';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
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
import {
    getLostIdentityName,
    createLostIdentity,
    recoverIdentity,
} from './util';

const addedMessage = (identityName: string, count: number) =>
    `Recovered ${count} credentials on ${identityName}.`;
const newIdentityMessage = (identityNumber: number, count: number) =>
    `Recovered ${count} credentials from identity on key index ${identityNumber}, naming identity: ${getLostIdentityName(
        identityNumber
    )}`;
const noIdentityMessage = (identityNumber: number) =>
    `Key index ${identityNumber} has not been used to create an identity yet.`;
const finishedMessage = 'Finished recovering credentials';

async function getPrfKeySeed(
    ledger: ConcordiumLedgerClient,
    setMessage: (message: string) => void,
    identityNumber: number
) {
    setMessage('Please confirm export of PRF key');
    const prfKeySeed = await ledger.getPrfKey(identityNumber);
    setMessage('Recovering credentials');
    return prfKeySeed.toString('hex');
}

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
        setMessages([]);

        const consensusStatus = await getConsensusStatus();
        const blockHash = consensusStatus.lastFinalizedBlock;

        const walletId = await pairWallet(ledger, dispatch);

        // Check for accounts on current identities
        for (const identity of identities) {
            if (identity.walletId === walletId) {
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setMessage,
                    identity.identityNumber
                );
                const added = await recoverIdentity(
                    prfKeySeed,
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
            const prfKeySeed = await getPrfKeySeed(
                ledger,
                setMessage,
                identityNumber
            );
            const addedCount = await recoverIdentity(
                prfKeySeed,
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

        setMessages((ms) => [...ms, finishedMessage]);
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Recovery</h1>
            </PageLayout.Header>
            <PageLayout.Container padding="vertical" className="flexColumn">
                <SimpleErrorModal
                    header="Unable to recover credentials"
                    content={error}
                    show={Boolean(error)}
                    onClick={() => dispatch(push(routes.IDENTITIES))}
                />
                <h2>Account Recovery</h2>
                <p>
                    Here you can recover the credentials and their accounts from
                    your current ledger device.{' '}
                </p>
                <Columns className="flexChildFill">
                    <Columns.Column>
                        <div className={styles.ledgerDiv}>
                            <SimpleLedger
                                className={styles.card}
                                ledgerCall={performRecovery}
                            />
                        </div>
                    </Columns.Column>
                    <Columns.Column>
                        <div className={styles.messages}>
                            <h2 className={styles.messagesTitle}>Messages:</h2>
                            {messages.map((m) => (
                                <>
                                    <p>{m}</p>
                                </>
                            ))}
                        </div>
                    </Columns.Column>
                </Columns>
            </PageLayout.Container>
        </PageLayout>
    );
}
