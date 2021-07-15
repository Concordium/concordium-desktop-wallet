import React, { useState, useEffect } from 'react';
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
import { recoverFromIdentity, recoverNewIdentity } from './util';
import { allowedSpacesIdentities } from '~/constants/recoveryConstants.json';
import { Account, StateUpdate } from '~/utils/types';
import AbortController from '~/utils/AbortController';
import Button from '~/cross-app-components/Button';

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
    setError: StateUpdate<string | undefined>;
}

/**
 * Displays the messages after recovery has been completed
 */
export default function RecoveryCompleted({
    setRecoveredAccounts,
    setError,
}: Props) {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const global = useSelector(globalSelector);
    const [controller] = useState(new AbortController());

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
        const maxExistingIdentityNumber = identitiesOfWallet.reduce(
            (currentMax, identity) =>
                Math.max(identity.identityNumber, currentMax),
            0
        );

        try {
            let skipsRemaining = allowedSpacesIdentities;
            let identityNumber = 0;
            while (
                skipsRemaining >= 0 ||
                identityNumber <= maxExistingIdentityNumber
            ) {
                if (controller.isAborted) {
                    controller.onAborted();
                    return;
                }
                const prfKeySeed = await getPrfKeySeed(
                    ledger,
                    setLedgerMessage,
                    identityNumber
                );
                const identity = findIdentity(identityNumber);
                let accounts: Account[];
                if (identity) {
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
                    skipsRemaining = allowedSpacesIdentities;
                } else {
                    const result = await recoverNewIdentity(
                        prfKeySeed,
                        blockHash,
                        global,
                        identityNumber,
                        walletId,
                        addressBook
                    );
                    accounts = result.accounts;
                    skipsRemaining = result.exists
                        ? allowedSpacesIdentities
                        : skipsRemaining - 1;
                }
                setRecoveredAccounts((ra) => [...ra, accounts]);
                identityNumber += 1;
            }
        } finally {
            loadAccounts(dispatch);
            loadCredentials(dispatch);
            loadIdentities(dispatch);
            loadAddressBook(dispatch);
        }
    }

    return (
        <>
            <p>
                Connect and unlock your Ledger device to get started. When
                prompted, allow export of the PRF keys on the Ledger. The wallet
                will then look for your accounts.
            </p>
            <div className={styles.ledgerDiv}>
                <SimpleLedger
                    className={styles.card}
                    ledgerCall={performRecovery}
                />
            </div>
            <Button
                inverted
                onClick={() => {
                    controller.abort();
                    dispatch(push(routes.RECOVERY_COMPLETED));
                }}
            >
                Stop recovery, I found all my accounts
            </Button>
        </>
    );
}
