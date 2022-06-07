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
    TransactionOrder,
    Global,
    CredentialNumberPrfKey,
    IdentityVersion,
    DecryptedTransferTransaction,
} from '~/utils/types';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { getISOFormat, secondsSinceUnixEpoch } from '~/utils/timeHelpers';
import transactionKindNames from '~/constants/transactionKindNames.json';
import { AccountReportMethods } from './preloadTypes';
import { isShieldedBalanceTransaction } from '~/utils/transactionHelpers';
import AbortController from '~/utils/AbortController';
import { getEntryName } from './database/addressBookDao';
import { getIdentityVersion } from './database/identityDao';
import { convertIncomingTransaction } from '~/utils/TransactionConverters';
import httpMethods from './http';
import decryptAmountsDao from './database/decryptedAmountsDao';
import { hasEncryptedBalance } from '~/utils/accountHelpers';
import isSuccessfulEncryptedTransaction from '~/utils/decryptHelpers';
import { formatCcdString, microCcdToCcd, getCcdSymbol } from '~/utils/ccd';

async function enrichWithDecryptedAmounts(
    credentialNumber: number,
    prfKeySeed: string,
    identityVersion: IdentityVersion,
    address: string,
    global: Global,
    transactions: TransferTransaction[],
    decryptTransactions: (
        encryptedTransfers: TransferTransaction[],
        accountAddress: string,
        prfKey: string,
        identityVersion: IdentityVersion,
        credentialNumber: number,
        global: Global
    ) => Promise<DecryptedTransferTransaction[]>
): Promise<TransferTransaction[]> {
    const encryptedTransactions = transactions.filter(
        isSuccessfulEncryptedTransaction
    );
    const decryptedAmounts = await decryptAmountsDao.findEntries(
        encryptedTransactions.map(
            (encryptedTransaction) => encryptedTransaction.transactionHash
        )
    );

    const withDecryptedAmounts: TransferTransaction[] = [];
    const toDecrypt: TransferTransaction[] = [];
    for (const t of transactions) {
        if (isSuccessfulEncryptedTransaction(t)) {
            const amount = decryptedAmounts.find(
                (decrypted) => decrypted.transactionHash === t.transactionHash
            )?.amount;
            if (!amount) {
                toDecrypt.push(t);
            }
        }
    }

    const decryptedTransactions = await decryptTransactions(
        toDecrypt,
        address,
        prfKeySeed,
        identityVersion,
        credentialNumber,
        global
    );
    const decryptedAmountsMap = new Map<string, string>();
    for (const dt of decryptedTransactions) {
        decryptedAmountsMap.set(dt.transactionHash, dt.decryptedAmount);
    }

    for (const t of transactions) {
        if (!isSuccessfulEncryptedTransaction(t)) {
            withDecryptedAmounts.push(t);
        } else {
            const amount = decryptedAmounts.find(
                (decrypted) => decrypted.transactionHash === t.transactionHash
            )?.amount;
            if (amount) {
                withDecryptedAmounts.push({ ...t, decryptedAmount: amount });
            } else {
                const decryptedAmount = decryptedAmountsMap.get(
                    t.transactionHash
                );
                if (!decryptedAmount) {
                    throw new Error('Internal error. This should never occur.');
                }

                await decryptAmountsDao.insert({
                    transactionHash: t.transactionHash,
                    amount: decryptedAmount,
                });
                withDecryptedAmounts.push({ ...t, decryptedAmount });
            }
        }
    }

    return withDecryptedAmounts;
}

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

const getName = (i: [string, string]) => i[0];
const getLabel = (i: [string, string]) => i[1];
const exportedFields = Object.entries(exportTransactionFields);
const amountFields = ['cost', 'subtotal', 'publicBalance', 'shieldedBalance'];
// Function to replace the field name to its label, with the chosen unit appended.
const getLabelWithUnit = (unit: string) => (i: [string, string]) => {
    const label = getLabel(i);
    if (amountFields.includes(getName(i))) {
        return `${label} (${unit})`;
    }
    return label;
};

// Parse a transaction into a array of values, corresponding to those of the exported fields.
function parseTransaction(
    transaction: TransferTransactionWithNames,
    address: string,
    convertToCcd: boolean
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

    if (convertToCcd) {
        for (const field of amountFields) {
            fieldValues[field] = formatCcdString(
                microCcdToCcd(fieldValues[field])
            );
        }
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
    global: Global,
    keys: Record<string, CredentialNumberPrfKey>,
    decryptTransactions: (
        encryptedTransfers: TransferTransaction[],
        accountAddress: string,
        prfKey: string,
        identityVersion: IdentityVersion,
        credentialNumber: number,
        global: Global
    ) => Promise<DecryptedTransferTransaction[]>,
    convertToCcd: boolean,
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

    const identityVersion = await getIdentityVersion(account.identityId);

    if (identityVersion === undefined) {
        throw new Error(`Unable to find identity of account: ${account.name}`);
    }

    const limit = 1000;
    const fromDate = filter.fromDate ? new Date(filter.fromDate) : undefined;
    let filterToUse = filter;

    let startId = '';
    let hasMore = true;

    const header = toCSV([
        exportedFields.map(
            getLabelWithUnit(
                convertToCcd ? getCcdSymbol() : `micro${getCcdSymbol()}`
            )
        ),
    ]);
    stream.write(header);
    stream.write('\n');

    const idReducer = (acc: bigint, t: TransferTransaction) =>
        acc === 0n || BigInt(t.id) < acc ? BigInt(t.id) : acc;

    while (hasMore) {
        if (abortController.isAborted) {
            return;
        }

        const {
            transactions: incomingTransactions,
            full,
        } = await httpMethods.getTransactions(
            account.address,
            filterToUse,
            limit,
            TransactionOrder.Descending,
            startId
        );

        let convertedTransactions = incomingTransactions.map((txn) =>
            convertIncomingTransaction(txn, account.address)
        );
        if (fromDate) {
            convertedTransactions = convertedTransactions.filter(
                (t) => Number(t.blockTime) >= secondsSinceUnixEpoch(fromDate)
            );
        }

        // If we filtered away some transactions, then this is the final page we needed to
        // fetch from the wallet proxy, as this means that we have reached the from date (if
        // one was set).
        let more = full;
        if (convertedTransactions.length < incomingTransactions.length) {
            more = false;
        }

        const entry = keys[account.address];

        let transactions;
        if (
            hasEncryptedBalance(account) &&
            (filter.encryptedAmountTransfer ||
                filter.encryptedAmountTransferWithMemo)
        ) {
            transactions = await enrichWithDecryptedAmounts(
                entry.credentialNumber,
                entry.prfKeySeed,
                identityVersion,
                account.address,
                global,
                convertedTransactions,
                decryptTransactions
            );
        } else {
            transactions = convertedTransactions;
        }

        hasMore = more;

        const withNames: TransferTransactionWithNames[] = await Promise.all(
            transactions.map(async (t) => ({
                ...t,
                fromName: await getAddressName(t.fromAddress),
                toName: await getAddressName(t.toAddress),
            }))
        );
        const asCSV = toCSV(
            withNames.map((t) =>
                parseTransaction(t, account.address, convertToCcd)
            )
        );
        stream.write(asCSV);
        stream.write('\n');

        if (more) {
            // Filter without dates, as the wallet proxy does not perform well
            // with fromDate and toDate. The filtering on dates is handled in-memory
            // above.
            filterToUse = {
                ...filterToUse,
                toDate: undefined,
                fromDate: undefined,
            };

            startId = transactions.reduce(idReducer, 0n).toString();
        }
    }
}

/**
 * Builds an account report at the given filename.
 */
async function buildAccountReportForSingleAccount(
    fileName: string,
    account: Account,
    filter: TransactionFilter,
    global: Global,
    keys: Record<string, CredentialNumberPrfKey>,
    decryptTransactions: (
        encryptedTransfers: TransferTransaction[],
        accountAddress: string,
        prfKey: string,
        identityVersion: IdentityVersion,
        credentialNumber: number,
        global: Global
    ) => Promise<DecryptedTransferTransaction[]>,
    convertToCcd: boolean,
    abortController: AbortController
) {
    abortController.start();

    const stream = fs.createWriteStream(fileName);
    const finishedWriting = new Promise<void>((resolve) =>
        stream.once('finish', resolve)
    );
    await streamTransactions(
        stream,
        account,
        filter,
        global,
        keys,
        decryptTransactions,
        convertToCcd,
        abortController
    );
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
    global: Global,
    keys: Record<string, CredentialNumberPrfKey>,
    decryptTransactions: (
        encryptedTransfers: TransferTransaction[],
        accountAddress: string,
        prfKey: string,
        identityVersion: IdentityVersion,
        credentialNumber: number,
        global: Global
    ) => Promise<DecryptedTransferTransaction[]>,
    convertToCcd: boolean,
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
        await streamTransactions(
            middleMan,
            account,
            filter,
            global,
            keys,
            decryptTransactions,
            convertToCcd,
            abortController
        );
        middleMan.end();

        if (abortController.isAborted) {
            break;
        }
    }

    // Wait for stream to be done writing
    const finishedWriting = new Promise<void>((resolve) =>
        stream.once('finish', resolve)
    );
    if (abortController.isAborted) {
        archive.abort();
    } else {
        archive.finalize();
    }
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
