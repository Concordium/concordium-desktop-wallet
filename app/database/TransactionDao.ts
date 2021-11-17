export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    getFilteredPendingTransactions,
    hasPendingShieldedBalanceTransfer,
    update: updateTransaction,
    insert: insertTransactions,
    getTransaction,
    deleteTransaction,
} = window.database.transaction;
