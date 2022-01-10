import {
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from './types';

const encryptedTypes = [
    TransactionKindString.EncryptedAmountTransfer,
    TransactionKindString.EncryptedAmountTransferWithMemo,
];

/**
 * Checks whether a transaction is an encrypted transfer that is successful, as in
 * not being a pending, rejected or failed transaction. Checking for this means that
 * one can assume that the 'encrypted' field is present.
 * @param transaction the transaction to test
 * @returns true if the transaction is an encrypted transfer (with or without memo), and not pending, rejected or failed.
 */
export default function isSuccessfulEncryptedTransaction(
    transaction: TransferTransaction
) {
    return (
        encryptedTypes.includes(transaction.transactionKind) &&
        ![
            TransactionStatus.Pending,
            TransactionStatus.Rejected,
            TransactionStatus.Failed,
        ].includes(transaction.status)
    );
}
