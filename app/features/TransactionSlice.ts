import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getTransactions } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getTransactionsOfAccount,
    insertTransactions,
    updateTransaction,
} from '../database/TransactionDao';
import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    Account,
    AccountTransaction,
    Dispatch,
    TransactionEvent,
    Global,
    RejectReason,
} from '../utils/types';
import { attachNames } from '../utils/transactionHelpers';
import {
    convertIncomingTransaction,
    convertAccountTransaction,
} from '../utils/TransactionConverters';
import { updateAccount } from '../database/AccountDao';
// eslint-disable-next-line import/no-cycle
import { loadAccounts } from './AccountSlice';

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
export async function decryptTransactions(
    transactions: TransferTransaction[],
    prfKey: string,
    account: Account,
    global: Global
) {
    const encryptedTransfers = transactions.filter(
        (t) =>
            t.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer &&
            t.decryptedAmount === null
    );

    if (encryptedTransfers.length > 0) {
        return Promise.resolve();
    }

    const encryptedAmounts = encryptedTransfers.map((t) => {
        if (!t.encrypted) {
            throw new Error('Unexpected missing field');
        }
        return JSON.parse(t.encrypted).encryptedAmount;
    });

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        account,
        global,
        prfKey
    );

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
 * Determine whether the transaction affects unshielded balance.
 */
function filterUnShieldedBalanceTransaction(transaction: TransferTransaction) {
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
function filterShieldedBalanceTransaction(transaction: TransferTransaction) {
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
export async function loadTransactions(account: Account, dispatch: Dispatch) {
    let transactions = await getTransactionsOfAccount(account, 'blockTime');
    transactions = await attachNames(transactions);
    dispatch(setTransactions(transactions));
}
// Reset the transactions in memory.
export async function resetTransactions(dispatch: Dispatch) {
    dispatch(setTransactions([]));
}

// Update the transaction from remote source.
export async function updateTransactions(dispatch: Dispatch, account: Account) {
    await loadTransactions(account, dispatch);
    const fromId = account.maxTransactionId || 0;
    const transactions = await getTransactions(account.address, fromId);
    if (transactions.length > 0) {
        await insertTransactions(
            transactions.map((transaction) =>
                convertIncomingTransaction(transaction, account.address)
            )
        );
        await updateAccount(account.name, {
            maxTransactionId: transactions.reduce(
                (id, t) => Math.max(id, t.id),
                0
            ),
        });
        loadAccounts(dispatch);
        loadTransactions(account, dispatch);
    }
}

// Add a pending transaction to storage
export async function addPendingTransaction(
    transaction: AccountTransaction,
    hash: string
) {
    const convertedTransaction = convertAccountTransaction(transaction, hash);
    return insertTransactions([convertedTransaction]);
}

// Set the transaction's status to confirmed, update the cost and whether it succeded.
// TODO: update Total to reflect change in cost.
export async function confirmTransaction(
    transactionHash: string,
    dataObject: Record<string, TransactionEvent>
) {
    const outcomes = Object.values(dataObject.outcomes);
    const success = outcomes.reduce(
        (accu, event) => accu && event.result.outcome === 'success',
        true
    );
    const cost = outcomes.reduce((accu, event) => accu + event.cost, 0);
    let rejectReason;
    if (!success) {
        const { tag } = outcomes.find(
            (event) => event.result.outcome !== 'success'
        ).result.rejectReason;
        rejectReason = RejectReason[tag as keyof typeof RejectReason];
    }
    return updateTransaction(
        { transactionHash },
        {
            status: TransactionStatus.Finalized,
            cost: cost.toString(),
            success,
            rejectReason,
        }
    );
}

// Set the transaction's status to rejected.
export async function rejectTransaction(transactionHash: string) {
    return updateTransaction(
        { transactionHash },
        { status: TransactionStatus.Rejected }
    );
}

export const transactionsSelector = (state: RootState) => {
    const filter = state.transactions.viewingShielded
        ? filterShieldedBalanceTransaction
        : filterUnShieldedBalanceTransaction;
    return state.transactions.transactions.filter(filter);
};

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export default transactionSlice.reducer;
