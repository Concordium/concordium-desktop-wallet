import {
    Account,
    TransferTransaction,
    TransactionKindString,
    TransactionStatus,
    TransferTransactionWithNames,
    RewardFilter,
} from '~/utils/types';
import {
    getTransactionsOfAccount,
    hasEncryptedTransactions,
} from '~/database/TransactionDao';
import { toCSV } from '~/utils/basicHelpers';
import { isOutgoingTransaction, lookupName } from '~/utils/transactionHelpers';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { getISOFormat } from '~/utils/timeHelpers';
import { isShieldedBalanceTransaction } from '~/features/TransactionSlice';
import {
    getActiveBooleanFilters,
    hasEncryptedBalance,
} from '~/utils/accountHelpers';
import transactionKindNames from '~/constants/transactionKindNames.json';

function calculatePublicBalanceChange(
    transaction: TransferTransaction,
    isOutgoing: boolean
): string {
    if (TransactionStatus.Rejected === transaction.status) {
        return '0';
    }
    if (TransactionStatus.Failed === transaction.status) {
        if (isOutgoing && transaction.cost) {
            return `-${transaction.cost}`;
        }
        return '0';
    }
    if (!isOutgoing) {
        return transaction.subtotal || '0';
    }
    if (
        TransactionKindString.TransferToPublic === transaction.transactionKind
    ) {
        return (
            BigInt(transaction.subtotal) - BigInt(transaction.cost || 0)
        ).toString();
    }
    return (
        -BigInt(transaction.subtotal) - BigInt(transaction.cost || 0)
    ).toString();
}

function calculateShieldedBalanceChange(
    transaction: TransferTransaction,
    isOutgoing: boolean
): string {
    if (
        [TransactionStatus.Failed, TransactionStatus.Rejected].includes(
            transaction.status
        )
    ) {
        return '0';
    }
    if (isShieldedBalanceTransaction(transaction)) {
        if (!transaction.decryptedAmount) {
            return '?';
        }
        switch (transaction.transactionKind) {
            case TransactionKindString.TransferToPublic:
            case TransactionKindString.TransferToEncrypted:
                return transaction.decryptedAmount;
            case TransactionKindString.EncryptedAmountTransfer:
                return isOutgoing
                    ? '-'.concat(transaction.decryptedAmount)
                    : transaction.decryptedAmount;
            default:
                throw new Error('unexpected transaction type');
        }
    } else {
        return '0';
    }
}

const getName = (i: string[]) => i[0];
const getLabel = (i: string[]) => i[1];
const exportedFields = Object.entries(exportTransactionFields);

// Parse a transaction into a array of values, corresponding to those of the exported fields.
function parseTransaction(
    transaction: TransferTransactionWithNames,
    address: string
) {
    const fieldValues: Record<string, string> = {};
    Object.entries(transaction).forEach(([key, value]) => {
        fieldValues[key] = value?.toString();
    });

    fieldValues.dateTime = getISOFormat(transaction.blockTime);
    fieldValues.transactionKind =
        transactionKindNames[transaction.transactionKind];

    const isOutgoing = isOutgoingTransaction(transaction, address);
    fieldValues.publicBalance = calculatePublicBalanceChange(
        transaction,
        isOutgoing
    );
    fieldValues.shieldedBalance = calculateShieldedBalanceChange(
        transaction,
        isOutgoing
    );
    if (!isOutgoing) {
        fieldValues.cost = '';
    }

    return exportedFields.map((field) => fieldValues[getName(field)]);
}

function showingShieldedTransfers(filters: RewardFilter) {
    return getActiveBooleanFilters(filters).includes(
        TransactionKindString.EncryptedAmountTransfer
    );
}

export async function containsEncrypted(
    account: Account,
    filters: RewardFilter
) {
    if (!showingShieldedTransfers(filters) || !hasEncryptedBalance(account)) {
        return false;
    }

    const { fromDate, toDate } = filters;

    const fromBlockTime = fromDate ? new Date(fromDate).getTime() : Date.now();
    const toBlockTime = toDate ? new Date(toDate).getTime() : 0;

    return hasEncryptedTransactions(
        account.address,
        (fromBlockTime / 1000).toString(),
        (toBlockTime / 1000).toString()
    );
}

// Updates transactions of the account, and returns them as a csv string.
export async function getAccountCSV(account: Account, filter: RewardFilter) {
    const { fromDate, toDate } = filter;
    const transactions = await getTransactionsOfAccount(
        account,
        getActiveBooleanFilters(filter),
        fromDate ? new Date(fromDate) : undefined,
        toDate ? new Date(toDate) : undefined
    );

    const withNames: TransferTransactionWithNames[] = await Promise.all(
        transactions.map(async (t) => ({
            ...t,
            fromName: await lookupName(t.fromAddress),
            toName: await lookupName(t.toAddress),
        }))
    );

    return toCSV(
        withNames.map((t) => parseTransaction(t, account.address)),
        exportedFields.map(getLabel)
    );
}
