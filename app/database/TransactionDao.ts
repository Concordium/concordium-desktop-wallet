export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasEncryptedTransactions,
    update: updateTransaction,
    insert: insertTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
} = window.database.transaction;
