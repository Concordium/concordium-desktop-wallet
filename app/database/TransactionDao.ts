export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasEncryptedTransactions,
    hasPendingShieldedBalanceTransfer,
    update: updateTransaction,
    insert: insertTransactions,
    upsertTransactionsAndUpdateMaxId,
    getTransactionsForAccount: getTransactionsOfAccount,
    getTransaction,
} = window.database.transaction;
