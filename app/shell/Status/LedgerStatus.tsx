import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import SuccessImage from '@resources/svg/success.svg';
import RejectedImage from '@resources/svg/warning.svg';
import useLedger from '~/components/ledger/useLedger';
import { LedgerStatusType } from '~/components/ledger/util';
import { asyncNoOp } from '~/utils/basicHelpers';
import { setCurrentWalletId } from '~/features/WalletSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getPairingPath } from '~/features/ledger/Path';
import { getWalletId } from '~/database/WalletDao';
import StatusPart from './StatusPart';

const listenerTimeout = 5000;

enum Status {
    NoWallet = 'No wallet',
    NewDevice = 'New device',
    OutDated = 'Outdated',
    Connected = 'Connected',
    OpenApp = 'Open app',
}

function getStatusImage(status: Status) {
    switch (status) {
        case Status.NoWallet:
        case Status.OutDated:
        case Status.OpenApp:
            return RejectedImage;
        case Status.NewDevice:
        case Status.Connected:
            return SuccessImage;
        default:
            return undefined;
    }
}

export default function LedgerStatus(): JSX.Element {
    const dispatch = useDispatch();
    const [hasBeenDisconnected, setDisconnected] = useState(true);
    const [statusText, setStatusText] = useState<Status>(Status.NoWallet);

    const onWalletIdentifier = useCallback(
        async (walletIdentifier: string) => {
            const walletId = await getWalletId(walletIdentifier);
            dispatch(setCurrentWalletId(walletId));
            if (!walletId) {
                setStatusText(Status.NewDevice);
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
        (ledger: ConcordiumLedgerClient) => listen(ledger, onWalletIdentifier),
        [listen, onWalletIdentifier]
    );

    const { status, submitHandler } = useLedger(callback, asyncNoOp);

    useEffect(() => {
        if (status === LedgerStatusType.DISCONNECTED) {
            setDisconnected(true);
            dispatch(setCurrentWalletId(undefined));
            setStatusText(Status.NoWallet);
        } else if (
            hasBeenDisconnected &&
            status === LedgerStatusType.OUTDATED
        ) {
            setDisconnected(false);
            setStatusText(Status.OutDated);
        } else if (
            hasBeenDisconnected &&
            status === LedgerStatusType.CONNECTED
        ) {
            setDisconnected(false);
            setStatusText(Status.Connected);
            submitHandler();
        } else if (status === LedgerStatusType.OPEN_APP) {
            setDisconnected(true);
            setStatusText(Status.OpenApp);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const StatusImage = getStatusImage(statusText);

    return (
        <StatusPart name="HW wallet:" status={statusText} Icon={StatusImage} />
    );
}
