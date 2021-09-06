import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';
import { loadCredentials } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { identitiesSelector } from '~/features/IdentitySlice';
import pairWallet from '~/utils/WalletPairing';
import routes from '~/constants/routes.json';
import errorMessages from '~/constants/errorMessages.json';
import {
    Status,
    recoverFromIdentity,
    recoverNewIdentity,
    getRecoveredIdentityName,
} from './util';
import { Account, StateUpdate } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import ChoiceModal from '~/components/ChoiceModal';
import { noOp } from '~/utils/basicHelpers';
import { identitySpacesBetweenWarning } from '~/constants/recoveryConstants.json';
import { useAsyncMemo } from '~/utils/hooks';
import AbortController from '~/utils/AbortController';

import styles from './Recovery.module.scss';

async function getPrfKeySeed(
    ledger: ConcordiumLedgerClient,
    setMessage: (message: string) => void,
    identityNumber: number
) {
    setMessage('Please allow recovering credentials');
    const prfKeySeed = await ledger.getPrfKey(identityNumber);
    setMessage('Recovering credentials');
    return prfKeySeed.toString('hex');
}

interface Props {
    setRecoveredAccounts: StateUpdate<Account[][]>;
    setStatus: StateUpdate<Status | undefined>;
    setCurrentIdentityNumber: StateUpdate<number>;
    currentIdentityNumber: number;
}

interface ShowStop {
    emptyCount: number;
    postAction: (location?: string) => void;
}

/**
 * Column, which performs the recovery.
 */
export default function PerformRecovery({
    setRecoveredAccounts,
    setStatus,
    setCurrentIdentityNumber,
    currentIdentityNumber,
}: Props) {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const global = useSelector(globalSelector);
    const [error, setError] = useState<string>();
    const [showStop, setShowStop] = useState<ShowStop>();
    const [recoveredTotal, setRecoveredTotal] = useState(0);
    const [emptyIndices, setEmptyIndices] = useState(0);

    const [controller] = useState(new AbortController());

    const blockHash = useAsyncMemo(getlastFinalizedBlockHash, () =>
        setError(errorMessages.unableToReachNode)
    );

    const findIdentity = useCallback(
        (identityNumber: number, walletId: number) =>
            identities.find(
                (identity) =>
                    identity.walletId === walletId &&
                    identity.identityNumber === identityNumber
            ),
        [identities]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setStatus(Status.Initial), []);

    function promptStop(emptyCount: number) {
        return new Promise((resolve) => {
            setShowStop({
                emptyCount,
                postAction: (location) => {
                    setShowStop(undefined);
                    resolve(Boolean(location));
                },
            });
        });
    }

    useEffect(() => {
        return () => {
            controller.abort();
            setStatus(undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function performRecovery(
        ledger: ConcordiumLedgerClient,
        setLedgerMessage: (message: string) => void
    ) {
        if (!global) {
            setError(errorMessages.missingGlobal);
            return;
        }
        if (!blockHash) {
            setError('Current Blockhash has not been loaded yet');
            return;
        }

        const walletId = await pairWallet(ledger, dispatch);

        const identityNumber = currentIdentityNumber;
        setStatus(Status.WaitingForInput);
        const prfKeySeed = await getPrfKeySeed(
            ledger,
            setLedgerMessage,
            identityNumber
        );
        setStatus(Status.Searching);
        const identity = findIdentity(identityNumber, walletId);
        let accounts: Account[];
        if (identity) {
            accounts = await recoverFromIdentity(
                prfKeySeed,
                blockHash,
                global,
                identity.id,
                controller
            );
            accounts.forEach((acc) => {
                acc.identityName = identity.name;
            });
            setEmptyIndices(0);
        } else {
            accounts = await recoverNewIdentity(
                prfKeySeed,
                blockHash,
                global,
                identityNumber,
                walletId,
                controller
            );
            const identityName = getRecoveredIdentityName(identityNumber);
            accounts.forEach((acc) => {
                acc.identityName = identityName;
            });
        }
        // We want to load credentials, to avoid all recovered accounts displaying readOnly symbols.
        loadCredentials(dispatch);

        if (controller.isAborted) {
            controller.finish();
            return;
        }

        setRecoveredTotal((n) => n + accounts.length);
        setRecoveredAccounts((ra) => [accounts, ...ra]);
        setCurrentIdentityNumber((n) => n + 1);
        setStatus(Status.Initial);

        if (identity || accounts.length) {
            setEmptyIndices(0);
        } else {
            if (
                emptyIndices > 0 &&
                (emptyIndices + 1) % identitySpacesBetweenWarning === 0
            ) {
                await promptStop(emptyIndices);
            }
            setEmptyIndices((n) => n + 1);
        }
    }

    const description = useMemo(
        () => (
            <>
                <p>
                    You have gone through {showStop?.emptyCount} identity
                    indices, without any accounts, in a row. Perhaps you have
                    already found all your accounts?
                </p>
                <p className="bodyEmphasized">
                    You found {recoveredTotal} accounts in total.
                </p>
                <p>
                    If this is the amount of accounts you expected, you can stop
                    the process now.
                </p>
                <p>
                    if you expected more accounts, you can continue and look for
                    more.
                </p>
            </>
        ),
        [showStop?.emptyCount, recoveredTotal]
    );

    return (
        <>
            <SimpleErrorModal
                header="Unable to recover credentials"
                content={error}
                show={Boolean(error)}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <ChoiceModal
                description={description}
                actions={[
                    { label: 'Look for more' },
                    {
                        label: 'Stop the process',
                        location: routes.RECOVERY_COMPLETED,
                    },
                ]}
                title="Continue the recovery?"
                open={Boolean(showStop)}
                postAction={showStop?.postAction || noOp}
            />
            <p>
                Connect and unlock your Ledger device to get started. When
                prompted, allow recovering credentials on the Ledger, for the
                current identity index. The wallet will then look for your
                accounts.
            </p>
            <div className={styles.ledgerDiv}>
                <SimpleLedger
                    className={styles.ledger}
                    ledgerCall={performRecovery}
                />
            </div>
            <Button
                inverted
                onClick={() => {
                    controller.abort();
                    setStatus(undefined);
                    dispatch(push(routes.RECOVERY_COMPLETED));
                }}
            >
                Stop recovery, I found all my accounts
            </Button>
        </>
    );
}
