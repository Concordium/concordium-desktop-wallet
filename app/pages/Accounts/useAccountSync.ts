import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
    loadAccounts,
    loadAccountInfos,
} from '~/features/AccountSlice';
import {
    updateTransactions,
    fetchNewestTransactions,
    resetTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import { noOp } from '~/utils/basicHelpers';
import { AccountStatus } from '~/utils/types';
import AbortControllerWithLooping from '~/utils/AbortControllerWithLooping';

async function load(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    return loadAccountInfos(accounts, dispatch);
}

// milliseconds between updates of the accountInfo
const accountInfoUpdateInterval = 30000;

/**
 * Keeps account info and transactions for selected account in sync.
 *
 * @returns
 * Optional error message.
 */
export default function useAccountSync() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    // This controller is used to abort updateTransactions, when the chosen account is changed, or the view is destroyed.
    const [controller] = useState(new AbortControllerWithLooping());
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            controller.hasLooped &&
            !controller.isAborted
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
        controller.hasLooped,
    ]);

    useEffect(() => {
        load(dispatch).catch((e: Error) => setError(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

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
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            controller.isReady &&
            !controller.isAborted
        ) {
            controller.start();
            dispatch(
                updateTransactions({
                    controller,
                    onError: setError,
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        accountInfo?.accountAmount,
        account?.status,
        controller.isAborted,
    ]);

    useEffect(() => {
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

    useEffect(() => {
        if (!account || account.status !== AccountStatus.Confirmed) {
            return;
        }

        dispatch(resetTransactions());
        dispatch(loadTransactions({ showLoading: true, force: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, JSON.stringify(account?.transactionFilter)]);

    return { error, clearError: () => setError(undefined) };
}
