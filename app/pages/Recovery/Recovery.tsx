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
import { allowedSpacesIdentities } from '~/constants/recoveryConstants.json';

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
        setLedgerMessage: (message: string) => void
    ) {
        if (!global) {
            setError(errorMessages.missingGlobal);
            return;
        }
        setMessages([]);
        const addMessage = (message: string) =>
            setMessages((ms) => [...ms, message]);

        const consensusStatus = await getConsensusStatus();
        const blockHash = consensusStatus.lastFinalizedBlock;

        const walletId = await pairWallet(ledger, dispatch);

        // Check for accounts on current identities
        for (const identity of identities) {
            if (identity.walletId === walletId) {
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setLedgerMessage,
                    identity.identityNumber
                );
                const added = await recoverIdentity(
                    prfKeySeed,
                    identity.id,
                    blockHash,
                    global,
                    await getNextCredentialNumber(identity.id)
                );
                addMessage(addedMessage(identity.name, added));
            }
        }

        // Check next identities
        let skipsRemaining = allowedSpacesIdentities;
        let identityNumber = await getNextIdentityNumber(walletId);
        while (skipsRemaining >= 0) {
            const identityId = await createLostIdentity(
                walletId,
                identityNumber
            );
            const prfKeySeed = await getPrfKeySeed(
                ledger,
                setLedgerMessage,
                identityNumber
            );
            const addedCount = await recoverIdentity(
                prfKeySeed,
                identityId,
                blockHash,
                global
            );
            if (addedCount) {
                addMessage(newIdentityMessage(identityNumber, addedCount));
                skipsRemaining = allowedSpacesIdentities;
            } else {
                addMessage(noIdentityMessage(identityNumber));
                skipsRemaining -= 1;
            }
            identityNumber += 1;
        }

        loadAccounts(dispatch);
        loadCredentials(dispatch);
        loadIdentities(dispatch);

        addMessage(finishedMessage);
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
                    your current ledger device.
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
                            {Boolean(messages.length) && (
                                <h2 className={styles.messagesTitle}>
                                    Recovery status:
                                </h2>
                            )}
                            {messages.map((m) => (
                                <p key={m}>{m}</p>
                            ))}
                        </div>
                    </Columns.Column>
                </Columns>
            </PageLayout.Container>
        </PageLayout>
    );
}
