export const getPendingTransactions: typeof window.database.transaction.getPending = (...args) => window.database.transaction.getPending(...args);
export const hasPendingTransactions: typeof window.database.transaction.hasPending = (...args) => window.database.transaction.hasPending(...args);
export const getFilteredPendingTransactions: typeof window.database.transaction.getFilteredPendingTransactions = (...args) => window.database.transaction.getFilteredPendingTransactions(...args);
export const hasPendingShieldedBalanceTransfer: typeof window.database.transaction.hasPendingShieldedBalanceTransfer = (...args) => window.database.transaction.hasPendingShieldedBalanceTransfer(...args);
export const updateTransaction: typeof window.database.transaction.update = (...args) => window.database.transaction.update(...args);
export const insertTransactions: typeof window.database.transaction.insert = (...args) => window.database.transaction.insert(...args);
export const getTransaction: typeof window.database.transaction.getTransaction = (...args) => window.database.transaction.getTransaction(...args);
export const deleteTransaction: typeof window.database.transaction.deleteTransaction = (...args) => window.database.transaction.deleteTransaction(...args);
