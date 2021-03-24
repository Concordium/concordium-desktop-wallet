import React, { useMemo } from 'react';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import Loading from '~/cross-app-components/Loading';
import { LedgerStatusType } from '../util';

import styles from './LedgerStatus.module.scss';

export interface LedgerStatusProps {
    status: LedgerStatusType;
    text: string;
}

export default function LedgerStatus({
    status,
    text,
}: LedgerStatusProps): JSX.Element {
    const statusIcon = useMemo(() => {
        switch (status) {
            case 'LOADING':
            case 'AWAITING_USER_INPUT':
            case 'OPEN_APP':
                return <Loading inline className={styles.icon} />;
            case 'ERROR':
                return <ErrorIcon className={styles.icon} />;
            case 'CONNECTED':
                return <CheckmarkIcon className={styles.icon} />;
            default:
                return null;
        }
    }, [status]);

    return (
        <div className={styles.root}>
            {statusIcon}
            <span className={styles.message}>{text}</span>
        </div>
    );
}
