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
    loadTransactions,
    fetchNewestTransactions,
    resetTransactions,
} from '~/features/TransactionSlice';
import { noOp } from '~/utils/basicHelpers';
import { AccountStatus } from '~/utils/types';
import AbortController from '~/utils/AbortController';

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
export default function useAccountSync(): string | undefined {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    // This controller is used to abort updateTransactions, when the chosen account is changed, or the view is destroyed.
    const [updateTransactionsController] = useState(new AbortController());
    // This controller is used to control when the wallet should load a batch of the newest transactions.
    const [newestTransactionsController] = useState(new AbortController(false));
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (
            account &&
            account.status === AccountStatus.Confirmed &&
            newestTransactionsController.isReady
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
        newestTransactionsController.isReady,
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
            updateTransactionsController.isReady &&
            !updateTransactionsController.isAborted
        ) {
            updateTransactionsController.start();
            dispatch(
                updateTransactions({
                    controller: updateTransactionsController,
                    onError: setError,
                    outdatedController: newestTransactionsController,
                })
            );
            return () => {
                newestTransactionsController.start();
            };
        }
        return noOp;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        accountInfo?.accountAmount,
        account?.status,
        updateTransactionsController.isAborted,
    ]);

    useEffect(() => {
        return () => updateTransactionsController.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

    useEffect(() => {
        if (account && account.status === AccountStatus.Confirmed) {
            const loadController = new AbortController();
            dispatch(resetTransactions());
            dispatch(
                loadTransactions({
                    controller: loadController,
                    showLoading: true,
                })
            );
            return () => loadController.abort();
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, JSON.stringify(account?.transactionFilter)]);

    return error;
}
