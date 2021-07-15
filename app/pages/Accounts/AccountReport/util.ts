import {
    Account,
    TransferTransaction,
    TransactionKindString,
    TransactionStatus,
    TransferTransactionWithNames,
} from '~/utils/types';
import { getTransactionsOfAccount } from '~/database/TransactionDao';
import { toCSV } from '~/utils/basicHelpers';
import { isOutgoingTransaction, lookupName } from '~/utils/transactionHelpers';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { dateFromTimeStamp, getISOFormat } from '~/utils/timeHelpers';
import { isShieldedBalanceTransaction } from '~/features/TransactionSlice';
import { hasEncryptedBalance } from '~/utils/accountHelpers';

type Filter = (transaction: TransferTransaction) => boolean;

function calculatePublicBalanceChange(
    transaction: TransferTransaction,
    isOutgoing: boolean
): string {
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

export interface FilterOption {
    filter: Filter;
    label: string;
    key: string;
}

export function filterKind(
    label: string,
    kind: TransactionKindString
): FilterOption {
    return {
        label,
        key: kind,
        filter: (transaction: TransferTransaction) =>
            transaction.transactionKind === kind,
    };
}

export function filterKindGroup(
    label: string,
    kinds: TransactionKindString[]
): FilterOption {
    return {
        label,
        key: label,
        filter: (transaction: TransferTransaction) =>
            kinds.includes(transaction.transactionKind),
    };
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
    if (
        fieldValues.status === TransactionStatus.Finalized &&
        !transaction.success
    ) {
        fieldValues.status = TransactionStatus.Failed;
    }

    return exportedFields.map((field) => fieldValues[getName(field)]);
}

function showingShieldedTransfers(filters: FilterOption[]) {
    return filters.some(
        (filter) => filter.key === TransactionKindString.EncryptedAmountTransfer
    );
}

async function getTransactions(
    account: Account,
    filterOptions: FilterOption[],
    fromTime?: Date,
    toTime?: Date
) {
    let { transactions } = await getTransactionsOfAccount(account, [], 1000000); // load from database
    transactions = transactions.filter(
        (transaction) =>
            (!fromTime ||
                dateFromTimeStamp(transaction.blockTime) > fromTime) &&
            (!toTime || dateFromTimeStamp(transaction.blockTime) < toTime)
    );
    return transactions.filter((transaction) =>
        filterOptions.some((filterOption) => filterOption.filter(transaction))
    );
}

export async function containsEncrypted(
    account: Account,
    filterOptions: FilterOption[],
    fromTime?: Date,
    toTime?: Date
) {
    if (
        !showingShieldedTransfers(filterOptions) ||
        !hasEncryptedBalance(account)
    ) {
        return false;
    }
    const transactions = await getTransactions(
        account,
        filterOptions,
        fromTime,
        toTime
    );
    return transactions.some(
        (transaction) => transaction.encrypted && !transaction.decryptedAmount
    );
}

// Updates transactions of the account, and returns them as a csv string.
export async function getAccountCSV(
    account: Account,
    filterOptions: FilterOption[],
    fromTime?: Date,
    toTime?: Date
) {
    const transactions = await getTransactions(
        account,
        filterOptions,
        fromTime,
        toTime
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
