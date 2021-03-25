import React, { useMemo } from 'react';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import Loading from '~/cross-app-components/Loading';
import { LedgerStatusType } from '../util';

import styles from './LedgerStatus.module.scss';

export interface LedgerStatusProps {
    status: LedgerStatusType;
    statusText: string;
}

export default function LedgerStatus({
    status,
    statusText,
}: LedgerStatusProps): JSX.Element {
    const statusIcon = useMemo(() => {
        switch (status) {
            case LedgerStatusType.LOADING:
            case LedgerStatusType.AWAITING_USER_INPUT:
            case LedgerStatusType.OPEN_APP:
                return <Loading inline className={styles.icon} />;
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
