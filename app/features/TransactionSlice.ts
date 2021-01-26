import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import { getTransactions, getGlobal } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getTransactionsOfAccount,
    insertTransactions,
    updateTransaction,
    getMaxTransactionsIdOfAccount,
} from '../database/TransactionDao';
import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    TransactionKindId,
    OriginType,
} from '../utils/types';
import { attachNames } from '../utils/transactionHelpers';

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
    },
    reducers: {
        setTransactions(state, transactions) {
            state.transactions = transactions.payload;
        },
        setViewingShielded(state, viewingShielded) {
            state.viewingShielded = viewingShielded.payload;
        },
    },
});

export const { setViewingShielded } = transactionSlice.actions;

const { setTransactions } = transactionSlice.actions;

// Decrypts the encrypted transfers in the given transacion list, using the prfKey.
// This function expects the prfKey to match the account's prfKey,
// and that the account is the receiver of the transactions.
export async function decryptTransactions(transactions, prfKey, account) {
    const global = (await getGlobal()).value;
    const encryptedTransfers = transactions.filter(
        (t) =>
            t.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer &&
            t.decryptedAmount === null
    );
    const encryptedAmounts = encryptedTransfers.map(
        (t) => JSON.parse(t.encrypted).encryptedAmount
    );

    let decryptedAmounts;
    if (encryptedTransfers.length > 0) {
        decryptedAmounts = await decryptAmounts(
            encryptedAmounts,
            account,
            global,
            prfKey
        );
    }

    return Promise.all(
        encryptedTransfers.map(async (transaction, index) =>
            updateTransaction(
                { id: transaction.id },
                {
                    decryptedAmount: decryptedAmounts[index],
                }
            )
        )
    );
}

/**
 * We have to do it like this, because the data from the wallet proxy
 * doesn't contain the receiving address, except in the event string.
 */
function getScheduleReceiver(transaction) {
    const event = transaction.details.events[0];
    return event.slice(event.lastIndexOf(' ') + 1);
}

/*
 * Converts the given transaction into the structure, which is used in the database.
 */
function convertIncomingTransaction(transaction): TransferTransaction {
    let fromAddress;
    if ('transferSource' in transaction.details) {
        fromAddress = transaction.details.transferSource;
    } else if (transaction.origin.type === OriginType.Account) {
        fromAddress = transaction.origin.address;
    }
    let toAddress;
    if ('transferDestination' in transaction.details) {
        toAddress = transaction.details.transferDestination;
    }
    let encrypted;
    if ('encrypted' in transaction) {
        encrypted = JSON.stringify(transaction.encrypted);
    }

    if (
        transaction.details.type === TransactionKindString.TransferWithSchedule
    ) {
        if (transaction.origin.type === OriginType.Account) {
            toAddress = getScheduleReceiver(transaction);
        }
    }

    return {
        remote: true,
        originType: transaction.origin.type,
        transactionKind: transaction.details.type,
        id: transaction.id,
        blockHash: transaction.blockHash,
        blockTime: transaction.blockTime,
        total: transaction.total,
        success: transaction.details.outcome === 'success',
        transactionHash: transaction.transactionHash,
        subtotal: transaction.subtotal,
        cost: transaction.cost,
        origin: JSON.stringify(transaction.origin),
        details: JSON.stringify(transaction.details),
        encrypted,
        fromAddress,
        toAddress,
        status: TransactionStatus.Finalized,
    };
}

/**
 * Determine whether the transaction affects unshielded balance.
 */
function filterUnShieldedBalanceTransaction(transaction) {
    switch (transaction.transactionKind) {
        case TransactionKindString.Transfer:
        case TransactionKindString.BakingReward:
        case TransactionKindString.TransferWithSchedule:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
            return true;
        default:
            return false;
    }
}

/**
 * Determine whether the transaction affects shielded balance.
 */
function filterShieldedBalanceTransaction(transaction) {
    switch (transaction.transactionKind) {
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
            return true;
        default:
            return false;
    }
}

// Load transactions from storage.
// Filters according to viewingShielded parameter
export async function loadTransactions(
    account,
    viewingShielded,
    dispatch: Dispatch
) {
    const filter = viewingShielded
        ? filterShieldedBalanceTransaction
        : filterUnShieldedBalanceTransaction;
    let transactions = await getTransactionsOfAccount(
        account,
        filter,
        'blockTime'
    );
    transactions = await attachNames(transactions);
    dispatch(setTransactions(transactions));
}

// Update the transaction from remote source.
export async function updateTransactions(account) {
    const fromId = await getMaxTransactionsIdOfAccount(account);
    const transactions = await getTransactions(account.address, fromId);
    if (transactions.length > 0) {
        await insertTransactions(transactions.map(convertIncomingTransaction));
    }
}

// Add a pending transaction to storage.
export async function addPendingTransaction(transaction, hash) {
    if (transaction.transactionKind !== TransactionKindId.Simple_transfer) {
        throw new Error('unsupported transaction type - please implement');
    }

    const convertedTransaction = {
        remote: false,
        originType: 'self',
        transactionKind: TransactionKindString.Transfer,
        transactionHash: hash,
        total: -(transaction.payload.amount + transaction.energyAmount),
        subtotal: -transaction.payload.amount,
        cost: transaction.energyAmount,
        fromAddress: transaction.sender,
        toAddress: transaction.payload.toAddress,
        blockTime: Date.now() / 1000, // Temporary value, unless it fails
        status: TransactionStatus.Pending,
    };
    return insertTransactions([convertedTransaction]);
}

// Set the transaction's status to confirmed, update the cost and whether it succeded.
// TODO: update Total to reflect change in cost.
export async function confirmTransaction(transactionHash, dataObject) {
    const success = Object.entries(dataObject.outcomes).reduce(
        (accu, [, event]) => accu && event.result.outcome === 'success',
        true
    );
    const cost = Object.entries(dataObject.outcomes).reduce(
        (accu, [, event]) => accu + event.cost,
        0
    );
    return updateTransaction(
        { transactionHash },
        { status: TransactionStatus.Finalized, cost, success }
    );
}

// Set the transaction's status to rejected.
export async function rejectTransaction(transactionHash) {
    return updateTransaction(
        { transactionHash },
        { status: TransactionStatus.Rejected }
    );
}

export const transactionsSelector = (state: RootState) =>
    state.transactions.transactions;

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export default transactionSlice.reducer;
