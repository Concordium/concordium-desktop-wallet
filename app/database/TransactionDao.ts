export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    getFilteredPending,
    hasEncryptedTransactions,
    hasPendingShieldedBalanceTransfer,
    update: updateTransaction,
    insert: insertTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
    getTransaction,
    deleteTransaction,
} = window.database.transaction;
