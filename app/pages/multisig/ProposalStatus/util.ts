import { MultiSignatureTransactionStatus } from '~/utils/types';

const { Submitted, Open } = MultiSignatureTransactionStatus;

/* eslint-disable import/prefer-default-export */
export function getStatusText(status: MultiSignatureTransactionStatus): string {
    if (status === Submitted) return 'Submitted - Pending';
    if (status === Open) return 'Unsubmitted';
    return status;
}
