import React, { useMemo } from 'react';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import ConnectIcon from '@resources/svg/logo-connection.svg';
import Loading from '~/cross-app-components/Loading';
import { LedgerStatusType } from '../util';

import styles from './LedgerStatus.module.scss';

export interface LedgerStatusProps {
    status: LedgerStatusType;
    statusText: string | JSX.Element;
}

export default function LedgerStatus({
    status,
    statusText,
}: LedgerStatusProps): JSX.Element {
    const statusIcon = useMemo(() => {
        switch (status) {
            case LedgerStatusType.DISCONNECTED:
            case LedgerStatusType.OPEN_APP:
                return <ConnectIcon className={styles.icon} />;
            case LedgerStatusType.LOADING:
            case LedgerStatusType.AWAITING_USER_INPUT:
                return <Loading inline className={styles.icon} />;
            case LedgerStatusType.OUTDATED:
            case LedgerStatusType.ERROR:
                return <ErrorIcon className={styles.icon} />;
            case LedgerStatusType.CONNECTED:
                return <CheckmarkIcon className={styles.icon} />;
            default:
                return null;
        }
    }, [status]);

    return (
        <div className={styles.root}>
            {statusIcon}
            <span className={styles.message}>{statusText}</span>
        </div>
    );
}
