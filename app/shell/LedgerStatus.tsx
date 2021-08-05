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
import getWalletDao from '~/database/WalletDao';

const listenerTimeout = 5000;

export default function LedgerStatus(): JSX.Element {
    const dispatch = useDispatch();
    const [hasBeenDisconnected, setDisconnected] = useState(true);
    const [statusText, setStatusText] = useState('');

    const onWalletIdentifier = useCallback(
        async (walletIdentifier: string) => {
            const walletId = await getWalletDao().getWalletId(walletIdentifier);
            dispatch(setCurrentWalletId(walletId));
            if (!walletId) {
                setStatusText('New device detected');
            }
        },
        [dispatch]
    );

    const listen = useCallback(
        async (
            ledger: ConcordiumLedgerClient,
            onWallet: (walletIdentifier: string) => void
        ) => {
            try {
                const walletIdentifier = await ledger.getPublicKeySilent(
                    getPairingPath()
                );
                onWallet(walletIdentifier.toString('hex'));
                return;
            } catch (e) {
                setTimeout(
                    () => listen(ledger, onWalletIdentifier),
                    listenerTimeout
                );
            }
        },
        [onWalletIdentifier]
    );

    const callback = useCallback(
        async (ledger: ConcordiumLedgerClient) => {
            listen(ledger, onWalletIdentifier);
        },
        [listen, onWalletIdentifier]
    );

    const { isReady, status, submitHandler } = useLedger(callback, asyncNoOp);

    useEffect(() => {
        if (status === LedgerStatusType.DISCONNECTED) {
            setDisconnected(true);
            dispatch(setCurrentWalletId(undefined));
            setStatusText('No wallet');
        } else if (
            hasBeenDisconnected &&
            status === LedgerStatusType.CONNECTED
        ) {
            setDisconnected(false);
            setStatusText('Wallet connected');
            submitHandler();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    return (
        <div className={clsx(styles.body, isReady && styles.greenText)}>
            {statusText}
        </div>
    );
}
