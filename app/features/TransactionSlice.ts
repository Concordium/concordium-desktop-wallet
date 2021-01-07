import { createSlice } from '@reduxjs/toolkit';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';
import { getTransactions, getGlobal } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getTransactionsOfAccount,
    insertTransactions,
} from '../database/TransactionDao';
import { Transaction } from '../utils/types';
import ConcordiumLedgerClient from './ledger/ConcordiumLedgerClient';

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        loadedTransactions: [],
        chosenIndex: 0,
    },
    reducers: {
        setTransactions(state, transactions) {
            state.loadedTransactions = transactions.payload;
        },
        chooseIndex(state, index) {
            state.chosenIndex = index.payload;
        },
    },
});

const { chooseIndex, setTransactions } = transactionSlice.actions;

async function decryptTransactions(transactions, account) {
    const global = (await getGlobal()).value;
    const indices = [];
    const encryptedAmounts = [];

    transactions.forEach((t, i) => {
        if (t.details.type === 'encryptedAmountTransfer') {
            encryptedAmounts.push(t.encrypted.encryptedAmount);
            indices.push(i);
        }
    });

    if (indices.length > 0) {
        const transport = await TransportNodeHid.open('');
        const ledger = new ConcordiumLedgerClient(transport);

        const decryptedAmounts = await decryptAmounts(
            encryptedAmounts,
            account,
            global,
            ledger
        );

        indices.forEach((oldIndex, amountIndex) => {
            transactions[oldIndex].total = decryptedAmounts[amountIndex];
        });
    }

    return transactions;
}

function convertIncomingTransaction(transaction): Transaction {
    let fromAddress;
    if ('transferSource' in transaction.details) {
        fromAddress = transaction.details.transferSource;
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

export async function loadTransactions(account, dispatch: Dispatch) {
    const transactions = await getTransactionsOfAccount(account);
    dispatch(setTransactions(transactions));
}

export async function updateTransactions(account, existingTransactions) {
    const highestId = existingTransactions.reduce(
        (id, t) => Math.max(id, t.id),
        0
    );
    const { transactions } = await getTransactions(account.address, highestId);
    if (transactions.length > 0) {
        const decryptedTransactions = await decryptTransactions(
            transactions,
            account
        );
        await insertTransactions(
            decryptedTransactions.map((t) => convertIncomingTransaction(t))
        );
    }
}

export const transactionsSelector = (state: RootState) =>
    state.transactions.loadedTransactions;
export const chosenIndexSelector = (state: RootState) =>
    state.transactions.chosenIndex;

export default transactionSlice.reducer;
