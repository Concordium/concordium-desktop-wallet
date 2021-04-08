import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import Card from '~/cross-app-components/Card';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { ClassName, MultiSignatureTransactionStatus } from '~/utils/types';
import { getStatusText } from './util';
import styles from './ProposalStatus.module.scss';

const {
    Submitted,
    Expired,
    Finalized,
    Rejected,
    Failed,
} = MultiSignatureTransactionStatus;

function getStatusClassName(
    status: MultiSignatureTransactionStatus
): string | undefined {
    if (status === Submitted) {
        return styles.rootPending;
    }
    if ([Expired, Rejected, Failed].includes(status)) {
        return styles.rootFailed;
    }
    if (status === Finalized) {
        return styles.rootSuccess;
    }
    return undefined;
}

export type ProposalStatusViewProps = PropsWithChildren<{
    title: string;
    status: MultiSignatureTransactionStatus;
    submittedOn?: Date;
    headerLeft: string;
    headerRight: string;
}> &
    ClassName;

export default function ProposalStatusView({
    title,
    status,
    submittedOn,
    headerLeft,
    headerRight,
    children,
    className,
}: ProposalStatusViewProps): JSX.Element {
    return (
        <Card
            className={clsx(styles.root, getStatusClassName(status), className)}
        >
            <header className={styles.header}>
                <span>{headerLeft}</span>
                <span>{headerRight}</span>
            </header>
            <div>
                <h2>{title}</h2>
                <h3>
                    Status:{' '}
                    <span className={styles.statusText}>
                        {getStatusText(status)}
                    </span>
                </h3>
            </div>
            <div className={styles.content}>{children}</div>
            <footer className={styles.footer}>
                <span />
                <span>
                    {submittedOn && getFormattedDateString(submittedOn)}
                </span>
            </footer>
        </Card>
    );
}
