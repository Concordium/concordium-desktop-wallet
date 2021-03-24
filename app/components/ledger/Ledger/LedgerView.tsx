import clsx from 'clsx';
import React from 'react';
import { ClassName } from '~/utils/types';
import LedgerStatus from '../LedgerStatus';
import { LedgerStatusType, LedgerSubmitHandler } from '../util';

import styles from './Ledger.module.scss';

export interface LedgerViewProps extends ClassName {
    status: LedgerStatusType;
    statusText: string;
    submitHandler: LedgerSubmitHandler;
    children(
        status: LedgerStatusType,
        submitHandler?: LedgerSubmitHandler
    ): JSX.Element;
}

export default function LedgerView({
    status,
    statusText,
    submitHandler,
    children,
    className,
}: LedgerViewProps): JSX.Element {
    return (
        <div className={clsx(styles.root, className)}>
            <LedgerStatus status={status} text={statusText} />
            <div className={styles.action}>
                {children(status, submitHandler)}
            </div>
        </div>
    );
}
