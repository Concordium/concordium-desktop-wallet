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
import { Transaction } from '../utils/types';
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

export async function decryptTransactions(transactions, prfKey, account) {
    const global = (await getGlobal()).value;
    const encryptedTransfers = transactions.filter(
        (t) =>
            t.transactionKind === 'encryptedAmountTransfer' &&
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
            updateTransaction(transaction.id, {
                decryptedAmount: decryptedAmounts[index],
            })
        )
    );
}

function convertIncomingTransaction(transaction): Transaction {
    let fromAddress;
    if ('transferSource' in transaction.details) {
        fromAddress = transaction.details.transferSource;
    } else if (transaction.origin.type === 'account') {
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
        status: 'finalized',
    };
}

function filterUnShieldedBalanceTransaction(transaction) {
    switch (transaction.transactionKind) {
        case 'transfer':
        case 'bakingReward':
        case 'transferWithSchedule': // TODO Ensure correct
        case 'transferToEncrypted':
        case 'transferToPublic':
            return true;
        default:
            return false;
    }
}

function filterShieldedBalanceTransaction(transaction) {
    switch (transaction.transactionKind) {
        case 'encryptedAmountTransfer':
        case 'transferToEncrypted':
        case 'transferToPublic':
            return true;
        default:
            return false;
    }
}

export async function loadTransactions(
    account,
    viewingShielded,
    dispatch: Dispatch
) {
    const filter = viewingShielded
        ? filterShieldedBalanceTransaction
        : filterUnShieldedBalanceTransaction;
    const transactions = await getTransactionsOfAccount(account, filter);
    await attachNames(transactions);
    dispatch(setTransactions(transactions));
}

export async function updateTransactions(account) {
    const fromId = await getMaxTransactionsIdOfAccount(account);
    const transactions = await getTransactions(account.address, fromId);
    if (transactions.length > 0) {
        await insertTransactions(
            transactions.map((t) => convertIncomingTransaction(t))
        );
    }
}

export const transactionsSelector = (state: RootState) =>
    state.transactions.transactions;

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export default transactionSlice.reducer;
