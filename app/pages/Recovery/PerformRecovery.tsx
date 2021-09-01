import React, { useState, useEffect, useMemo } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';
import { loadAccounts } from '~/features/AccountSlice';
import { loadCredentials } from '~/features/CredentialSlice';
import { globalSelector } from '~/features/GlobalSlice';
import {
    loadAddressBook,
    addressBookSelector,
} from '~/features/AddressBookSlice';
import { loadIdentities, identitiesSelector } from '~/features/IdentitySlice';
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
import AbortController from '~/utils/AbortController';
import Button from '~/cross-app-components/Button';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import ChoiceModal from '~/components/ChoiceModal';
import { noOp } from '~/utils/basicHelpers';
import { identitySpacesBetweenWarning } from '~/constants/recoveryConstants.json';

import styles from './Recovery.module.scss';

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
    setRecoveredAccounts: StateUpdate<Account[][]>;
    setStatus: StateUpdate<Status | undefined>;
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
}: Props) {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const global = useSelector(globalSelector);
    const [controller] = useState(new AbortController());
    const [error, setError] = useState<string>();
    const [showStop, setShowStop] = useState<ShowStop>();
    const [recoveredTotal, setRecoveredTotal] = useState(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setStatus(Status.initial), []);

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
        return () => controller.abort();
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

        const blockHash = await getlastFinalizedBlockHash();

        const walletId = await pairWallet(ledger, dispatch);
        const identitiesOfWallet = identities.filter(
            (i) => i.walletId === walletId
        );

        const findIdentity = (identityNumber: number) =>
            identitiesOfWallet.find(
                (identity) => identity.identityNumber === identityNumber
            );

        try {
            let emptyIndices = 0;
            let identityNumber = 0;
            while (!controller.isAborted) {
                if (
                    emptyIndices > 0 &&
                    emptyIndices % identitySpacesBetweenWarning === 0
                ) {
                    const stopped = await promptStop(emptyIndices);
                    if (stopped) {
                        break;
                    }
                }
                setStatus(Status.waitingForInput);
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setLedgerMessage,
                    identityNumber
                );
                setStatus(Status.searching);
                const identity = findIdentity(identityNumber);
                let accounts: Account[];
                if (identity) {
                    emptyIndices = 0;
                    accounts = await recoverFromIdentity(
                        prfKeySeed,
                        blockHash,
                        global,
                        identity.id,
                        addressBook
                    );
                    accounts.forEach((acc) => {
                        acc.identityName = identity.name;
                    });
                } else {
                    accounts = await recoverNewIdentity(
                        prfKeySeed,
                        blockHash,
                        global,
                        identityNumber,
                        walletId,
                        addressBook
                    );
                    const identityName = getRecoveredIdentityName(
                        identityNumber
                    );
                    accounts.forEach((acc) => {
                        acc.identityName = identityName;
                    });
                    if (accounts.length) {
                        emptyIndices = 0;
                    } else {
                        emptyIndices += 1;
                    }
                }
                loadCredentials(dispatch);
                setRecoveredTotal((n) => n + accounts.length);
                setRecoveredAccounts((ra) => [...ra, accounts]);
                identityNumber += 1;
            }
        } finally {
            controller.finish();
            loadAccounts(dispatch);
            loadIdentities(dispatch);
            loadAddressBook(dispatch);
            setStatus(undefined);
        }
    }

    const description = useMemo(
        () => (
            <>
                <p>
                    You have gone through {showStop?.emptyCount} empty indices
                    in a row. Have you maybe found all your accounts?
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
                prompted, allow export of the PRF keys on the Ledger. The wallet
                will then look for your accounts.
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
