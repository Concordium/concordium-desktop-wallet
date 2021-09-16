import { TransferTransaction } from '~/utils/types';

export interface TransactionListProps {
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}
