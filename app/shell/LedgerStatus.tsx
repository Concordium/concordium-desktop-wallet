import React, { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import useLedger from '~/components/ledger/useLedger';
import { LedgerStatusType } from '~/components/ledger/util';
import { asyncNoOp } from '~/utils/basicHelpers';
import styles from './LedgerStatus.module.scss';
import { setCurrentWalletId } from '~/features/WalletSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import { getId } from '~/database/WalletDao';

export default function LedgerStatus(): JSX.Element {
    const dispatch = useDispatch();
    const [hasBeenDisconnected, setDisconnected] = useState(true);
    const [statusText, setStatusText] = useState('');

    const callback = useCallback(
        async (ledger: ConcordiumLedgerClient) => {
            try {
                const walletIdentifier = await ledger.getPublicKeySilent(
                    getPairingPath()
                );
                const walletId = await getId(walletIdentifier.toString('hex'));
                await dispatch(setCurrentWalletId(walletId));
            } catch (e) {
                setStatusText('Pairing Failed');
            }
        },
        [dispatch]
    );

    const { isReady, status, submitHandler } = useLedger(callback, asyncNoOp);

    useEffect(() => {
        if (status === LedgerStatusType.LOADING) {
            setDisconnected(true);
            dispatch(setCurrentWalletId(undefined));
        } else if (
            hasBeenDisconnected &&
            status === LedgerStatusType.CONNECTED
        ) {
            setDisconnected(false);
            submitHandler();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    useEffect(() => {
        if (hasBeenDisconnected) {
            setStatusText(isReady ? 'Device Ready' : 'Waiting for device');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    return (
        <div className={clsx(styles.body, isReady && styles.greenText)}>
            {statusText}
        </div>
    );
}
