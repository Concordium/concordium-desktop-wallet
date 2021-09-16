export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasEncryptedTransactions,
    update: updateTransaction,
    insert: insertTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
    getTransaction,
} = window.database.transaction;
