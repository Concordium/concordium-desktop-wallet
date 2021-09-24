import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Mutex } from 'async-mutex';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
} from '~/features/AccountSlice';
import {
    updateTransactions,
    fetchNewestTransactions,
    resetTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import { noOp } from '~/utils/basicHelpers';
import { AccountStatus } from '~/utils/types';
import useThunkDispatch from '~/store/useThunkDispatch';

// milliseconds between updates of the accountInfo
const accountInfoUpdateInterval = 30000;

/**
 * Keeps account info and transactions for selected account in sync. Is dependant on a full re-mount when chosen account changes.
 */
export default function useAccountSync(onError: (message: string) => void) {
    const dispatch = useThunkDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const abortUpdateRef = useRef(noOp);
    const { current: updateLock } = useRef(new Mutex());
    const [updateLooped, setUpdateLooped] = useState(false);

    useEffect(() => {
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            updateLooped
        ) {
            fetchNewestTransactions(dispatch, account);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.transactionFilter?.bakingReward,
        account?.transactionFilter?.blockReward,
        account?.transactionFilter?.finalizationReward,
        account?.transactionFilter?.fromDate,
        account?.transactionFilter?.toDate,
        updateLooped,
    ]);

    useEffect(() => {
        if (!account) {
            return noOp;
        }

        updateAccountInfo(account, dispatch);
        const interval = setInterval(() => {
            updateAccountInfo(account, dispatch);
        }, accountInfoUpdateInterval);

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.status, account?.selfAmounts, account?.incomingAmounts]);

    useEffect(() => {
        (async () => {
            if (
                account?.status !== AccountStatus.Confirmed ||
                updateLock.isLocked() // If update is already running, we don't need to run again because of new transactions (accountInfo.accountAmount).
            ) {
                return;
            }

            const unlock = await updateLock.acquire();

            const update = dispatch(
                updateTransactions({
                    onFirstLoop() {
                        setUpdateLooped(true);
                    },
                    onError,
                })
            );

            abortUpdateRef.current = update.abort;

            await update;

            unlock();
            setUpdateLooped(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountInfo?.accountAmount, account?.status]);

    useEffect(
        () => () => {
            abortUpdateRef.current();
        },
        []
    );

    useEffect(() => {
        if (!account || account.status !== AccountStatus.Confirmed) {
            return noOp;
        }

        dispatch(resetTransactions());
        const load = dispatch(
            loadTransactions({
                showLoading: true,
                force: true,
            })
        );

        return () => {
            load.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(account?.transactionFilter)]);
}
