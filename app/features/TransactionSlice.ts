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
import { TransferTransaction } from '../utils/types';
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
 * Because the data from the wallet proxy doesn't contain the receiving
 */
function getScheduleReceiver(transaction) {
    const event = transaction.details.events[0];
    return event.slice(event.lastIndexOf(' ') + 1);
}

function convertIncomingTransaction(transaction): TransferTransaction {
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

    if (transaction.details.type === 'transferWithSchedule') {
        if (transaction.origin.type === 'account') {
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
    const transactions = await getTransactionsOfAccount(
        account,
        filter,
        'blockTime'
    );
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

export async function addPendingTransaction(transaction, hash, account) {
    if (transaction.transactionKind !== 3) {
        console.log('unsupported transaction type - please implement');
    }

    const convertedTransaction = {
        remote: false,
        originType: 'self',
        transactionKind: 'transfer',
        transactionHash: hash,
        total: -(transaction.payload.amount + transaction.energyAmount),
        subtotal: -transaction.payload.amount,
        cost: transaction.energyAmount,
        fromAddress: transaction.sender,
        toAddress: transaction.payload.toAddress,
        blockTime: Date.now() / 1000, // Temporary value, unless it fails
        status: 'pending',
    };
    return insertTransactions([convertedTransaction]);
}

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
        { status: 'finalized', cost, success }
    );
}

export async function rejectTransaction(transactionHash) {
    return updateTransaction({ transactionHash }, { status: 'rejected' });
}

export const transactionsSelector = (state: RootState) =>
    state.transactions.transactions;

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export default transactionSlice.reducer;
