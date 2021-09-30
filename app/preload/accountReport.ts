import fs from 'fs';
import {
    Account,
    TransferTransaction,
    TransactionKindString,
    TransactionStatus,
    TransferTransactionWithNames,
    TransactionFilter,
} from '~/utils/types';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { getISOFormat } from '~/utils/timeHelpers';
import transactionKindNames from '~/constants/transactionKindNames.json';
import transactionMethods from './database/transactionsDao';
import { AccountReportMethods } from './preloadTypes';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';

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

/**
 * Determine whether the transaction affects shielded balance.
 */
function isShieldedBalanceTransaction(
    transaction: Partial<TransferTransaction>
) {
    switch (transaction.transactionKind) {
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.EncryptedAmountTransferWithMemo:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
            return true;
        default:
            return false;
    }
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

    const isOutgoing = transaction.fromAddress === address;
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

/** Given a list of elements, a function to parse the elements to string array,
 * and the names of the elements' fields, outputs
 * csv string, with the names first, and the values of each element per line.
 */
function toCSV(elements: string[][]): string {
    return `${elements.map((element) => element.join(',')).join('\n')}`;
}

async function streamToFile(
    fileName: string,
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    fromDate?: Date,
    startToDate?: Date
) {
    const limit = 10000;
    let toDate = startToDate;
    let startId = '';
    let hasMore = true;
    const stream = fs.createWriteStream(fileName);
    stream.write(toCSV([exportedFields.map(getLabel)]));

    const idReducer = (acc: bigint, t: TransferTransaction) =>
        acc === 0n || BigInt(t.id) < acc ? BigInt(t.id) : acc;

    while (hasMore) {
        const {
            transactions,
            more,
        } = await transactionMethods.getTransactionsForAccount(
            account,
            filteredTypes,
            fromDate,
            toDate,
            limit,
            startId
        );
        toDate = new Date(
            transactions.reduce(
                (acc, t) =>
                    acc === 0 || parseInt(t.blockTime, 10) < acc
                        ? parseInt(t.blockTime, 10)
                        : acc,
                0
            ) + 1
        );
        startId = transactions.reduce(idReducer, 0n).toString();
        hasMore = more;
        const asCSV = toCSV(
            transactions.map((t) => parseTransaction(t, account.address))
        );
        stream.write(asCSV);
    }
    stream.end();
}

const exposedMethods: AccountReportMethods = {
    single: async (
        fileName: string,
        account: Account,
        filter: TransactionFilter
    ) => {
        const { fromDate, toDate } = filter;
        try {
            await streamToFile(
                fileName,
                account,
                getActiveBooleanFilters(filter),
                fromDate ? new Date(fromDate) : undefined,
                toDate ? new Date(toDate) : undefined
            );
            return true;
        } catch (e) {
            return false;
        }
    },
};

export default exposedMethods;
