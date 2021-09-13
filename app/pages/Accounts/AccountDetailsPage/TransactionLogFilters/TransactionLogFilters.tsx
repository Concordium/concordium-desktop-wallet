import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TransactionFilters, {
    TransactionFiltersRef,
} from '~/components/TransactionFilters';
import Button from '~/cross-app-components/Button';
import {
    chosenAccountSelector,
    updateTransactionFilter,
} from '~/features/AccountSlice';
import { TransactionFilter, Account } from '~/utils/types';

import styles from './TransactionLogFilters.module.scss';

interface Props {
    onUpdate(): void;
}

export default function TransactionLogFilters({ onUpdate }: Props) {
    const account = useSelector(chosenAccountSelector);
    const { transactionFilter = {}, address } = account ?? ({} as Account);
    const ref = useRef<TransactionFiltersRef>(null);
    const dispatch = useDispatch();

    const handleUpdate = useCallback(
        (store: boolean) => async (filter: TransactionFilter) => {
            await updateTransactionFilter(dispatch, address, filter, store);
            onUpdate();
        },
        [dispatch, address, onUpdate]
    );

    const clear = useCallback(() => {
        ref.current?.clear(handleUpdate(true));
    }, [ref, handleUpdate]);

    const submit = useCallback(
        (store: boolean) => () => {
            ref.current?.submit(handleUpdate(store));
        },
        [ref, handleUpdate]
    );

    return (
        <>
            <TransactionFilters ref={ref} values={transactionFilter} />
            <footer className={styles.footer}>
                <Button size="tiny" onClick={submit(false)}>
                    Apply
                </Button>
                <Button size="tiny" onClick={submit(true)}>
                    Save
                </Button>
                <Button size="tiny" onClick={clear}>
                    Clear
                </Button>
            </footer>
        </>
    );
}
