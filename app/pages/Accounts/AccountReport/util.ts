import {
    Account,
    TransferTransaction,
    TransactionKindString,
    TransactionStatus,
    TransferTransactionWithNames,
} from '~/utils/types';
import {
    getTransactionsOfAccount,
    hasEncryptedTransactions,
} from '~/database/TransactionDao';
import { toCSV } from '~/utils/basicHelpers';
import { isOutgoingTransaction, lookupName } from '~/utils/transactionHelpers';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { dateFromTimeStamp, getISOFormat } from '~/utils/timeHelpers';
import { isShieldedBalanceTransaction } from '~/features/TransactionSlice';
import { hasEncryptedBalance } from '~/utils/accountHelpers';
import transactionKindNames from '~/constants/transactionKindNames.json';

type Filter = (transaction: TransferTransaction) => boolean;

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

export interface FilterOption {
    filter: Filter;
    label: string;
    key: string;
}

export function filterKind(kind: TransactionKindString): FilterOption {
    return {
        // put an s to pluralize. (Assumes that no transaction name needs specific pluralization)
        label: `${transactionKindNames[kind]}s`,
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

function showingShieldedTransfers(filters: FilterOption[]) {
    return filters.some(
        (filter) => filter.key === TransactionKindString.EncryptedAmountTransfer
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

    const fromBlockTime = fromTime ? fromTime.getTime() : Date.now();
    const toBlockTime = toTime ? toTime.getTime() : 0;
    return hasEncryptedTransactions(
        account.address,
        (fromBlockTime / 1000).toString(),
        (toBlockTime / 1000).toString()
    );
}

// Updates transactions of the account, and returns them as a csv string.
export async function getAccountCSV(
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
    transactions = transactions.filter((transaction) =>
        filterOptions.some((filterOption) => filterOption.filter(transaction))
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
