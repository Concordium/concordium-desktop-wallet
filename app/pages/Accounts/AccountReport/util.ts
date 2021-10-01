/* eslint-disable import/prefer-default-export */
import {
    Account,
    TransactionFilter,
    TransactionKindString,
} from '~/utils/types';
import { hasEncryptedTransactions } from '~/database/TransactionDao';
import {
    getActiveBooleanFilters,
    hasEncryptedBalance,
} from '~/utils/accountHelpers';

function showingShieldedTransfers(filters: TransactionFilter) {
    return getActiveBooleanFilters(filters).includes(
        TransactionKindString.EncryptedAmountTransfer
    );
}

export async function containsEncrypted(
    account: Account,
    filters: TransactionFilter
) {
    if (!showingShieldedTransfers(filters) || !hasEncryptedBalance(account)) {
        return false;
    }

    const { fromDate, toDate } = filters;

    const fromBlockTime = fromDate ? new Date(fromDate).getTime() : 0;
    const toBlockTime = toDate ? new Date(toDate).getTime() : Date.now();

    return hasEncryptedTransactions(
        account.address,
        (fromBlockTime / 1000).toString(),
        (toBlockTime / 1000).toString()
    );
}
