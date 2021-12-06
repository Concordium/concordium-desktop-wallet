import { TransferTransaction } from '~/utils/types';

export interface TransactionListProps {
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
    abortRef?: React.MutableRefObject<
        ((reason?: string | undefined) => void) | undefined
    >;
}
