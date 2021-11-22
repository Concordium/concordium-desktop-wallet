import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
} from '~/features/AccountSlice';
import {
    resetTransactions,
    loadTransactions,
    loadNewTransactions,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';
import { noOp } from '~/utils/basicHelpers';
import { AccountStatus } from '~/utils/types';
import useThunkDispatch from '~/store/useThunkDispatch';

// milliseconds between updates of the accountInfo
const accountInfoUpdateInterval = 30000;

export const accountInfoFailedMessage = (message: string) =>
    `Failed to load account information from your connected node due to: ${message}`;

/**
 * Ensures that the account info (from the node) and the list of transactions (from the wallet proxy),
 * for the selected account, are kept synchronized. Is dependant on a full re-mount when the
 * chosen account changes.
 */
export default function useAccountSync(onError: (message: string) => void) {
    const dispatch = useThunkDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);
    const abortUpdateRef = useRef(noOp);
    const [loadIsDone, setIsLoadDone] = useState(false);
    // A change to the newTransactionsFlag is used to signal that new
    // transactions are available and should be loaded.
    const [newTransactionsFlag, setNewTransactionsFlag] = useState<boolean>(
        false
    );
    const accountInfoLoaded = Boolean(accountInfo);

    // Periodically update the account info to keep it in sync
    // with the information from the node.
    useEffect(() => {
        if (!account || account.status !== AccountStatus.Confirmed) {
            return noOp;
        }

        updateAccountInfo(account, dispatch).catch((e: Error) =>
            onError(accountInfoFailedMessage(e.message))
        );
        const interval = setInterval(() => {
            updateAccountInfo(account, dispatch).catch((e: Error) =>
                onError(accountInfoFailedMessage(e.message))
            );
        }, accountInfoUpdateInterval);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.status, account?.selfAmounts, account?.incomingAmounts]);

    useEffect(
        () => () => {
            abortUpdateRef.current();
        },
        []
    );

    const newTransactionsDependencyArray = [
        accountInfo?.accountAmount,
        JSON.stringify(accountInfo?.accountEncryptedAmount.incomingAmounts),
    ];
    useEffect(() => {
        if (loadIsDone) {
            setNewTransactionsFlag(!newTransactionsFlag);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, newTransactionsDependencyArray);

    // Load any new transactions if the account amount changes, as that indicates that a
    // transaction affected the account.
    useEffect(() => {
        if (loadIsDone) {
            const load = dispatch(
                loadNewTransactions({
                    showLoading: true,
                })
            );

            return () => {
                load.abort();
            };
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newTransactionsFlag]);

    // Re-load transactions entirely from the wallet proxy if:
    // - the filter is changed
    // - the status of the account changes, e.g. if it is confirmed,
    // - the user switches between viewing shielded or unshielded transactions
    // given that the account info has already been loaded.
    const loadDependencyArray = [
        JSON.stringify(account?.transactionFilter),
        account?.status,
        accountInfoLoaded,
        viewingShielded,
    ];
    useEffect(() => {
        if (!accountInfoLoaded) {
            // Do not load anything until we also have the account info
            // available.
            return noOp;
        }

        dispatch(resetTransactions());

        if (account?.status !== AccountStatus.Confirmed) {
            return noOp;
        }

        const load = dispatch(
            loadTransactions({
                showLoading: true,
                force: true,
            })
        );
        load.then(unwrapResult)
            .then(() => setIsLoadDone(true))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    onError(error.message);
                }
            });

        return () => {
            load.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, loadDependencyArray);
}
