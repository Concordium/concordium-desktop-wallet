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
 * Keeps account info and transactions for selected account in sync.
 *
 * @returns
 * Optional error message.
 */
export default function useAccountSync(onError: (message: string) => void) {
    const dispatch = useThunkDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const [abortUpdate, setAbortUpdate] = useState<(() => void) | undefined>(
        undefined
    );
    const { current: updateLock } = useRef(new Mutex());
    const [updateAborted, setUpdateAborted] = useState(false);
    const [updateLooped, setUpdateLooped] = useState(false);

    useEffect(() => {
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            updateLooped &&
            !updateAborted
        ) {
            fetchNewestTransactions(dispatch, account);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        account?.transactionFilter?.bakingReward,
        account?.transactionFilter?.blockReward,
        account?.transactionFilter?.finalizationReward,
        account?.transactionFilter?.fromDate,
        account?.transactionFilter?.toDate,
        updateLooped,
        updateAborted,
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
    }, [
        account?.address,
        account?.status,
        account?.selfAmounts,
        account?.incomingAmounts,
    ]);

    useEffect(() => {
        (async () => {
            const isRunning = updateLock.isLocked() && !updateAborted;
            if (account?.status !== AccountStatus.Confirmed || isRunning) {
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

            setAbortUpdate(() => update.abort);

            await update;

            updateLock.runExclusive(() => {
                setUpdateLooped(false);
                setUpdateAborted(false);
            });

            unlock();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        accountInfo?.accountAmount,
        account?.status,
        updateAborted,
    ]);

    useEffect(() => {
        if (!abortUpdate) {
            return noOp;
        }

        return () => {
            setUpdateAborted(true);
            abortUpdate();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, abortUpdate]);

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
    }, [account?.address, JSON.stringify(account?.transactionFilter)]);
}
