import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import useThunkDispatch from '~/store/useThunkDispatch';

async function handleLoad(dispatch: Dispatch) {
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
    const dispatch = useThunkDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    // This controller is used to abort updateTransactions, when the chosen account is changed, or the view is destroyed.
    const [controller] = useState(new AbortControllerWithLooping());
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        console.log('init');
    }, []);

    useEffect(() => {
        console.log('loop', controller.hasLooped);
    }, [controller.hasLooped]);

    useEffect(() => {
        console.log('abort', controller.isAborted);
    }, [controller.isAborted]);

    useEffect(() => {
        console.log('ready', controller.isReady);
    }, [controller.isReady]);

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
        handleLoad(dispatch).catch((e: Error) => setError(e.message));
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
        console.log('(re)start', controller.isReady);
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
        controller.isReady,
    ]);

    useEffect(() => {
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

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

    return { error, clearError: () => setError(undefined) };
}
