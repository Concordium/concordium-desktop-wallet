import clsx from 'clsx';
import React from 'react';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import { getStatusText } from '../../ProposalStatus/util';
import styles from './ProposalViewStatusText.module.scss';

const {
    Submitted,
    Expired,
    Finalized,
    Rejected,
    Failed,
} = MultiSignatureTransactionStatus;

type ProposalViewStatusTextProps = MultiSignatureTransaction;

function getStatusClassName(
    status: MultiSignatureTransactionStatus
): string | undefined {
    if (status === Submitted) {
        return styles.pending;
    }
    if ([Expired, Rejected, Failed].includes(status)) {
        return styles.error;
    }
    if (status === Finalized) {
        return styles.success;
    }
    return undefined;
}

export default function ProposalViewStatusText({
    status,
}: ProposalViewStatusTextProps): JSX.Element {
    return (
        <div>
            <h5 className="mB0">Status</h5>
            <span
                className={clsx(styles.statusText, getStatusClassName(status))}
            >
                {getStatusText(status)}
            </span>
        </div>
    );
}
