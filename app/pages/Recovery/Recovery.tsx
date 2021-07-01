import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import Columns from '~/components/Columns';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';
import { loadAccounts } from '~/features/AccountSlice';
import { loadCredentials, importCredentials } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { loadIdentities, identitiesSelector } from '~/features/IdentitySlice';
import { getNextIdentityNumber } from '~/database/IdentityDao';
import pairWallet from '~/utils/WalletPairing';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import errorMessages from '~/constants/errorMessages.json';
import {
    getRecoveredIdentityName,
    recoverFromIdentity,
    recoverCredentials,
    addAccounts,
    createRecoveredIdentity,
} from './util';
import { allowedSpacesIdentities } from '~/constants/recoveryConstants.json';
import { StateUpdate } from '~/utils/types';

import styles from './Recovery.module.scss';

const addedMessage = (identityName: string, count: number) =>
    `Recovered ${count} credentials on ${identityName}.`;
const newIdentityMessage = (identityNumber: number, count: number) =>
    `Recovered ${count} credentials from identity on key index ${identityNumber}, naming identity: ${getRecoveredIdentityName(
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

interface Props {
    messages: string[];
    setMessages: StateUpdate<string[]>;
}

/**
 * Component to run the account recovery algorithm.
 */
export default function Recovery({ messages, setMessages }: Props) {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const global = useSelector(globalSelector);
    const [error, setError] = useState<string>();

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

        const blockHash = await getlastFinalizedBlockHash();

        const walletId = await pairWallet(ledger, dispatch);

        // Check for accounts on current identities
        for (const identity of identities) {
            if (identity.walletId === walletId) {
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setLedgerMessage,
                    identity.identityNumber
                );
                const added = await recoverFromIdentity(
                    prfKeySeed,
                    blockHash,
                    global,
                    identity.id
                );
                addMessage(addedMessage(identity.name, added));
            }
        }

        // Next we check identityNumbers, where we don't have saved identities:
        let skipsRemaining = allowedSpacesIdentities;
        let identityNumber = await getNextIdentityNumber(walletId);
        while (skipsRemaining >= 0) {
            const prfKeySeed = await getPrfKeySeed(
                ledger,
                setLedgerMessage,
                identityNumber
            );
            const { credentials, accounts } = await recoverCredentials(
                prfKeySeed,
                0,
                blockHash,
                global
            );
            const addedCount = credentials.length;

            if (addedCount) {
                const identityId = await createRecoveredIdentity(
                    walletId,
                    identityNumber
                );
                await addAccounts(
                    accounts.map((acc) => {
                        return { ...acc, identityId };
                    })
                );
                await importCredentials(
                    credentials.map((cred) => {
                        return { ...cred, identityId };
                    })
                );
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
        dispatch(
            push({
                pathname: routes.RECOVERY_COMPLETED,
                state: messages,
            })
        );
    }

    return (
        <>
            <SimpleErrorModal
                header="Unable to recover credentials"
                content={error}
                show={Boolean(error)}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
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
        </>
    );
}
