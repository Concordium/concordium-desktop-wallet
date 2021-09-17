export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasEncryptedTransactions,
    hasPendingShieldedBalanceTransfer,
    update: updateTransaction,
    insert: insertTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
    getMinTransactionId,
} = window.database.transaction;
