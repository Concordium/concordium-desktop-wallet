import fs from 'fs';
import archiver from 'archiver';
import { PassThrough, Writable } from 'stream';
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
import { isShieldedBalanceTransaction } from '~/utils/transactionHelpers';
import AbortController from '~/utils/AbortController';
import { getEntryName } from './database/addressBookDao';

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
            case TransactionKindString.EncryptedAmountTransferWithMemo:
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

/** Given a nested list of strings, parses the elements to csv,
 *   each inner list is turned into a line.
 */
function toCSV(elements: string[][]): string {
    return elements.map((element) => element.join(',')).join('\n');
}

/**
 * Streams the given account's transactions into the given writable, csv formatted.
 * @param stream a Writable, which the transactions are written to.
 * @param account account from which transactions are selected.
 */
async function streamTransactions(
    stream: Writable,
    account: Account,
    filter: TransactionFilter,
    abortController: AbortController
) {
    const getAddressName = async (address: string) => {
        if (!address) {
            return undefined;
        }
        if (address === account.address) {
            return account.name;
        }
        return getEntryName(address);
    };

    const limit = 10000;
    const filteredTypes = getActiveBooleanFilters(filter);

    const fromDate = filter.fromDate ? new Date(filter.fromDate) : undefined;
    let toDate = filter.toDate ? new Date(filter.toDate) : undefined;

    let startId = '';
    let hasMore = true;

    stream.write(toCSV([exportedFields.map(getLabel)]));
    stream.write('\n');

    const idReducer = (acc: bigint, t: TransferTransaction) =>
        acc === 0n || BigInt(t.id) < acc ? BigInt(t.id) : acc;

    while (hasMore) {
        if (abortController.isAborted) {
            return;
        }

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

        const withNames: TransferTransactionWithNames[] = await Promise.all(
            transactions.map(async (t) => ({
                ...t,
                fromName: await getAddressName(t.fromAddress),
                toName: await getAddressName(t.toAddress),
            }))
        );
        const asCSV = toCSV(
            withNames.map((t) => parseTransaction(t, account.address))
        );
        stream.write(asCSV);
    }
}

/**
 * Builds an account report at the given filename.
 */
async function buildAccountReportForSingleAccount(
    fileName: string,
    account: Account,
    filter: TransactionFilter,
    abortController: AbortController
) {
    abortController.start();

    const stream = fs.createWriteStream(fileName);
    const finishedWriting = new Promise<void>((resolve) =>
        stream.once('finish', resolve)
    );
    await streamTransactions(stream, account, filter, abortController);
    stream.end();
    abortController.finish();
    return finishedWriting;
}

/**
 * Builds a zip archive containing account reports, for each given account, at the given filename.
 */
async function buildAccountReportForMultipleAccounts(
    fileName: string,
    accounts: Account[],
    filter: TransactionFilter,
    abortController: AbortController
) {
    abortController.start();

    // Setup zip archive builder:
    const stream = fs.createWriteStream(fileName);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(stream);

    for (const account of accounts) {
        // setup stream to add report for current account
        const middleMan = new PassThrough();
        const name = `${account.name}.csv`;
        archive.append(middleMan, { name });

        // build report
        await streamTransactions(middleMan, account, filter, abortController);
        middleMan.end();

        if (abortController.isAborted) {
            archive.abort();
            break;
        }
    }

    // Wait for stream to be done writing
    const finishedWriting = new Promise<void>((resolve) =>
        stream.once('finish', resolve)
    );
    archive.finalize();
    abortController.finish();
    return finishedWriting;
}

const abortController = new AbortController();

const exposedMethods: AccountReportMethods = {
    single: (...params) =>
        buildAccountReportForSingleAccount(...params, abortController),
    multiple: (...params) =>
        buildAccountReportForMultipleAccounts(...params, abortController),
    abort: () => abortController.abort(),
};

export default exposedMethods;
