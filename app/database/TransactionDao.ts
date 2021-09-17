export const {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasEncryptedTransactions,
    update: updateTransaction,
    insert: insertTransactions,
    upsertTransactionsAndUpdateMaxId,
    getTransactionsForAccount: getTransactionsOfAccount,
} = window.database.transaction;
