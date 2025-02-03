import { useEffect, useRef, useState, useCallback } from 'react';
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
    const accountInfoLoaded = Boolean(accountInfo);
    const [updateAccountInfoSwitch, setUpdateAccountInfoSwitch] = useState(
        true
    );

    const loadNew = useCallback(
        (onlyLoadNewShielded: boolean) => {
            if (loadIsDone && !account?.transactionFilter.toDate) {
                const load = dispatch(
                    loadNewTransactions({ onlyLoadNewShielded })
                );
                return () => {
                    load.abort();
                };
            }
            return () => {};
        },
        [loadIsDone, account?.transactionFilter.toDate, dispatch]
    );

    // Periodically update the account info to keep it in sync
    // with the information from the node.
    useEffect(() => {
        if (!account || account.status !== AccountStatus.Confirmed) {
            return noOp;
        }

        updateAccountInfo(account, accountInfo, dispatch).catch((e: Error) =>
            onError(accountInfoFailedMessage(e.message))
        );

        const timeout = setTimeout(
            () => setUpdateAccountInfoSwitch(!updateAccountInfoSwitch),
            accountInfoUpdateInterval
        );

        return () => {
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.status,
        account?.selfAmounts,
        account?.incomingAmounts,
        updateAccountInfoSwitch,
    ]);

    useEffect(
        () => () => {
            abortUpdateRef.current();
        },
        []
    );

    // Load any new shielded transactions if the shielded amount changes.
    useEffect(() => {
        if (viewingShielded) {
            return loadNew(true);
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(accountInfo?.accountEncryptedAmount.incomingAmounts)]);

    // Load any new transactions if the account amount changes, as that indicates that a
    // transaction affected the account.
    useEffect(() => {
        if (!viewingShielded) {
            return loadNew(false);
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountInfo?.accountAmount.microCcdAmount]);

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
            // available. We use this to prevent fetching new transactions on
            // a balance change, as those effects react on the first available
            // accountInfo and we don't want them to do anything until after the
            // first load has completed.
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
                onlyLoadShielded: viewingShielded,
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
