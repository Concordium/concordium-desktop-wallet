import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    updateAccountInfo,
} from '~/features/AccountSlice';
import {
    updateTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import { noOp } from '~/utils/basicHelpers';
import { AccountStatus } from '~/utils/types';
import AbortController from '~/utils/AbortController';

// milliseconds between updates of the accountInfo
const accountInfoUpdateInterval = 30000;

export default function useAccountSync() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const [controller] = useState(new AbortController());

    useEffect(() => {
        if (account) {
            updateAccountInfo(account, dispatch);
            const interval = setInterval(async () => {
                updateAccountInfo(account, dispatch);
            }, accountInfoUpdateInterval);
            return () => {
                clearInterval(interval);
            };
        }
        return noOp;
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
            updateTransactions(dispatch, account, controller);
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
    }, [account?.address, ...Object.values(account?.rewardFilter ?? {})]);
}
