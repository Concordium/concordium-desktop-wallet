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
    const [controller] = useState(new AbortController());
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        load(dispatch).catch((e: Error) => setError(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        if (!account) {
            return noOp;
        }

        updateAccountInfo(account, dispatch);
        const interval = setInterval(async () => {
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
            updateTransactions(dispatch, account, controller).catch(setError);
            return () => {
                controller.abort();
            };
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        account?.address,
        accountInfo?.accountAmount,
        account?.status,
        controller.isAborted,
    ]);

    useEffect(() => {
        if (account && account.status === AccountStatus.Confirmed) {
            const loadController = new AbortController();
            loadTransactions(account, dispatch, true, loadController);
            return () => loadController.abort();
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address, account?.transactionFilter]);

    return error;
}
