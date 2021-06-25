import { MultiSignatureTransactionStatus } from '~/utils/types';

const { Submitted, Open, Closed } = MultiSignatureTransactionStatus;

/* eslint-disable import/prefer-default-export */
export function getStatusText(status: MultiSignatureTransactionStatus): string {
    if (status === Submitted) return 'Submitted - Pending';
    if (status === Open) return 'Unsubmitted';
    if (status === Closed) return 'Cancelled';
    return status;
}
