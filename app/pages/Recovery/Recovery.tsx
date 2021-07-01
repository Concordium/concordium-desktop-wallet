import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import Columns from '~/components/Columns';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';
import { loadAccounts } from '~/features/AccountSlice';
import { loadCredentials } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { loadIdentities, identitiesSelector } from '~/features/IdentitySlice';
import pairWallet from '~/utils/WalletPairing';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import errorMessages from '~/constants/errorMessages.json';
import { recoverFromIdentity, recoverNewIdentity } from './util';
import { allowedSpacesIdentities } from '~/constants/recoveryConstants.json';
import { StateUpdate } from '~/utils/types';

import styles from './Recovery.module.scss';

const addedMessage = (identityName: string, count: number) =>
    `Recovered ${count} credentials on ${identityName}.`;
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
        const identitiesOfWallet = identities.filter(
            (i) => i.walletId === walletId
        );

        const findIdentity = (identityNumber: number) =>
            identitiesOfWallet.find(
                (i) =>
                    i.identityNumber === identityNumber &&
                    i.walletId === walletId
            );

        try {
            let skipsRemaining = allowedSpacesIdentities;
            let identityNumber = 0;
            while (skipsRemaining >= 0) {
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setLedgerMessage,
                    identityNumber
                );
                const identity = findIdentity(identityNumber);
                if (identity) {
                    const addedCount = await recoverFromIdentity(
                        prfKeySeed,
                        blockHash,
                        global,
                        identity.id
                    );
                    addMessage(addedMessage(identity.name, addedCount));
                    skipsRemaining = allowedSpacesIdentities;
                } else {
                    const { exists, message } = await recoverNewIdentity(
                        prfKeySeed,
                        blockHash,
                        global,
                        identityNumber,
                        walletId
                    );
                    addMessage(message);
                    skipsRemaining = exists
                        ? allowedSpacesIdentities
                        : skipsRemaining - 1;
                }
                identityNumber += 1;
            }
        } finally {
            loadAccounts(dispatch);
            loadCredentials(dispatch);
            loadIdentities(dispatch);
        }

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
