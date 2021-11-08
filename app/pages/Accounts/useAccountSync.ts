import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
} from '~/features/AccountSlice';
import {
    resetTransactions,
    loadTransactions,
    loadNewTransactions,
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
    const abortUpdateRef = useRef(noOp);
    const [loadIsDone, setIsLoadDone] = useState(false);
    const [localAccountAmount, setLocalAccountAmount] = useState<string>();
    const accountInfoLoaded = Boolean(accountInfo);

    // Periodically update the account info to keep it in sync
    // with the information from the node.
    useEffect(() => {
        if (!account) {
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

    useEffect(() => {
        if (loadIsDone) {
            setLocalAccountAmount(accountInfo?.accountAmount);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountInfo?.accountAmount]);

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
    }, [localAccountAmount]);

    // Re-load transactions entirely from the wallet proxy if:
    // - the filter is changed
    // - the status of the account changes, e.g. if it is confirmed
    // given that the account info has already been loaded.
    const loadDependencyArray = [
        JSON.stringify(account?.transactionFilter),
        account?.status,
        accountInfoLoaded,
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
        setIsLoadDone(true);

        return () => {
            load.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, loadDependencyArray);
}
