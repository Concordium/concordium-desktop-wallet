import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getTransactions } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getMinTransactionId,
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
    TransferTransactionWithNames,
} from '../utils/types';
import { isSuccessfulTransaction } from '../utils/transactionHelpers';
import {
    convertIncomingTransaction,
    convertAccountTransaction,
} from '../utils/TransactionConverters';
// eslint-disable-next-line import/no-cycle
import {
    updateMaxTransactionId,
    updateAllDecrypted,
    chosenAccountSelector,
} from './AccountSlice';
import AbortController from '~/utils/AbortController';
import { RejectReason } from '~/utils/node/RejectReasonHelper';
import { isDefined, max } from '~/utils/basicHelpers';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import errorMessages from '~/constants/errorMessages.json';

const updateTransactionInterval = 5000;
export const transactionLogPageSize = 100;

interface State {
    transactions: TransferTransaction[];
    viewingShielded: boolean;
    loadingTransactions: boolean;
    lowestTransactionId: string;
}

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
        loadingTransactions: false,
        lowestTransactionId: '0',
    } as State,
    reducers: {
        setTransactions(
            state,
            update: PayloadAction<{
                transactions: TransferTransaction[];
                lowestId: string;
            }>
        ) {
            state.transactions = update.payload.transactions;
            state.lowestTransactionId = update.payload.lowestId;
        },
        appendTransactions(
            state,
            update: PayloadAction<TransferTransaction[]>
        ) {
            state.transactions.push(...update.payload);
        },
        setViewingShielded(state, viewingShielded) {
            state.viewingShielded = viewingShielded.payload;
        },
        setLoadingTransactions(state, loading) {
            state.loadingTransactions = loading.payload;
        },
        updateTransactionFields(state, update) {
            const { hash, updatedFields } = update.payload;
            const index = state.transactions.findIndex(
                (transaction) => transaction.transactionHash === hash
            );
            if (index > -1) {
                state.transactions[index] = {
                    ...state.transactions[index],
                    ...updatedFields,
                };
            }
        },
    },
});

export const { setViewingShielded } = transactionSlice.actions;

const {
    setTransactions,
    updateTransactionFields,
    setLoadingTransactions,
    appendTransactions,
} = transactionSlice.actions;

// Decrypts the encrypted transfers in the given transacion list, using the prfKey.
// This function expects the prfKey to match the account's prfKey,
// and that the account is the receiver of the transactions.
export async function decryptTransactions(
    accountAddress: string,
    prfKey: string,
    credentialNumber: number,
    global: Global
) {
    const encryptedTransfers = await getTransactionsOfAccount(accountAddress, [
        TransactionKindString.EncryptedAmountTransfer,
        TransactionKindString.EncryptedAmountTransferWithMemo,
    ]);
    const notDecrypted = encryptedTransfers.filter(
        (t) =>
            t.decryptedAmount === null &&
            t.status === TransactionStatus.Finalized
    );

    if (notDecrypted.length === 0) {
        return Promise.resolve();
    }

    const encryptedAmounts = notDecrypted.map((t) => {
        if (!t.encrypted) {
            throw new Error('Unexpected missing field');
        }
        if (t.fromAddress === accountAddress) {
            return JSON.parse(t.encrypted).inputEncryptedAmount;
        }
        return JSON.parse(t.encrypted).encryptedAmount;
    });

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        credentialNumber,
        global,
        prfKey
    );

    return Promise.all(
        notDecrypted.map(async (transaction, index) =>
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
function isUnshieldedBalanceTransaction(
    transaction: TransferTransaction,
    currentAddress: string
) {
    return !(
        [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
        ].includes(transaction.transactionKind) &&
        transaction.fromAddress !== currentAddress
    );
}

/**
 * Determine whether the transaction affects shielded balance.
 */
export function isShieldedBalanceTransaction(
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

interface LoadTransactionsArgs {
    showLoading?: boolean;
    controller?: AbortController;
    append?: boolean;
    size?: number;
}

/**
 * Load transactions from storage.
 * Filters out reward transactions based on the account's transaction filter.
 */
export const loadTransactions = createAsyncThunk(
    'transactions/load',
    async (
        {
            showLoading = false,
            append = false,
            size = transactionLogPageSize,
            controller,
        }: LoadTransactionsArgs,
        { getState, dispatch }
    ) => {
        const state = getState() as RootState;
        const minId = state.transactions.transactions
            .map((t) => t.id)
            .filter(isDefined)
            .reverse()[0];

        const account = chosenAccountSelector(state);

        if (!account) {
            return;
        }

        if (showLoading) {
            dispatch(setLoadingTransactions(true));
        }

        const { fromDate, toDate } = account.transactionFilter;
        const booleanFilters = getActiveBooleanFilters(
            account.transactionFilter
        );
        const transactions = await getTransactionsOfAccount(
            account.address,
            booleanFilters,
            fromDate ? new Date(fromDate) : undefined,
            toDate ? new Date(toDate) : undefined,
            size,
            append ? minId : undefined
        );

        if (controller?.isAborted) {
            return;
        }

        if (showLoading) {
            dispatch(setLoadingTransactions(false));
        }

        if (append) {
            dispatch(appendTransactions(transactions));
        } else {
            const lowestId = await getMinTransactionId(
                account.address,
                booleanFilters,
                fromDate ? new Date(fromDate) : undefined,
                toDate ? new Date(toDate) : undefined
            );

            dispatch(setTransactions({ transactions, lowestId }));
        }
    }
);

export const reloadTransactions = createAsyncThunk(
    'transactions/reload',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const { transactions } = state.transactions;
        const account = chosenAccountSelector(state);

        if (!account) {
            return;
        }

        await dispatch(loadTransactions({ size: transactions.length }));
    }
);

async function fetchTransactions(address: string, currentMaxId: bigint) {
    const { transactions, full } = await getTransactions(
        address,
        currentMaxId.toString()
    );

    const newMaxId = transactions.reduce(
        (id, t) => max(id, BigInt(t.id)),
        currentMaxId
    );
    const isFinished = !full;

    const newTransactions = await insertTransactions(
        transactions.map((transaction) =>
            convertIncomingTransaction(transaction, address)
        )
    );
    const newEncrypted = newTransactions.some(isShieldedBalanceTransaction);

    return { newMaxId, isFinished, newEncrypted };
}

/** Update the transactions from remote source.
 * will fetch transactions in intervals, updating the state each time.
 * stops when it reaches the newest transaction, or it is told to abort by the controller.
 * */
export async function updateTransactions(
    dispatch: Dispatch,
    account: Account,
    controller: AbortController
) {
    return new Promise<void>((resolve, reject) => {
        async function updateSubroutine(maxId: bigint) {
            if (controller.isAborted) {
                controller.finish();
                resolve();
                return;
            }

            let result;
            try {
                result = await fetchTransactions(account.address, maxId);
            } catch (e) {
                controller.finish();
                reject(errorMessages.unableToReachWalletProxy);
                return;
            }

            if (maxId !== result.newMaxId) {
                await updateMaxTransactionId(
                    dispatch,
                    account.address,
                    result.newMaxId.toString()
                );
            }

            if (result.newEncrypted) {
                await updateAllDecrypted(dispatch, account.address, false);
            }

            if (controller.isAborted) {
                controller.finish();
                resolve();
                return;
            }
            if (maxId !== result.newMaxId && !result.isFinished) {
                setTimeout(
                    updateSubroutine,
                    updateTransactionInterval,
                    result.newMaxId
                );
                return;
            }
            resolve();
            controller.finish();
        }

        updateSubroutine(
            account.maxTransactionId ? BigInt(account.maxTransactionId) : 0n
        );
    });
}

// Add a pending transaction to storage
export async function addPendingTransaction(
    transaction: AccountTransaction,
    hash: string
) {
    const convertedTransaction = await convertAccountTransaction(
        transaction,
        hash
    );
    await insertTransactions([convertedTransaction]);
    return convertedTransaction;
}

/**
 * Set the transaction's status to confirmed, update the cost and whether it suceeded
 * or not.
 */
export async function confirmTransaction(
    dispatch: Dispatch,
    transactionHash: string,
    blockHash: string,
    event: TransactionEvent
) {
    const success = isSuccessfulTransaction(event);
    const { cost } = event;

    let rejectReason;
    if (!success) {
        if (!event.result.rejectReason) {
            throw new Error('Missing rejection reason in transaction event');
        }

        rejectReason =
            RejectReason[
                event.result.rejectReason.tag as keyof typeof RejectReason
            ];
        if (rejectReason === undefined) {
            // If the reject reason was not known, then just store it directly as a string anyway.
            rejectReason = event.result.rejectReason.tag;
        }
    }

    const status = success
        ? TransactionStatus.Finalized
        : TransactionStatus.Failed;

    const update = {
        status,
        cost: cost.toString(),
        rejectReason,
        blockHash,
    };
    updateTransaction({ transactionHash }, update);
    return dispatch(
        updateTransactionFields({
            hash: transactionHash,
            updatedFields: update,
        })
    );
}

// Set the transaction's status to rejected.
export async function rejectTransaction(
    dispatch: Dispatch,
    transactionHash: string
) {
    const status = { status: TransactionStatus.Rejected };
    updateTransaction({ transactionHash }, status);
    return dispatch(
        updateTransactionFields({
            hash: transactionHash,
            updatedFields: status,
        })
    );
}

const attachNames = (state: RootState) => (
    transaction: TransferTransaction
) => {
    const findName = (address: string) =>
        state.addressBook.addressBook.find((e) => e.address === address)?.name;

    return {
        ...transaction,
        toName: findName(transaction.toAddress),
        fromName: findName(transaction.fromAddress),
    };
};

export const transactionsSelector = (
    state: RootState
): TransferTransactionWithNames[] => {
    const mapNames = attachNames(state);

    if (state.transactions.viewingShielded) {
        return state.transactions.transactions
            .filter(isShieldedBalanceTransaction)
            .map(mapNames);
    }

    const address = chosenAccountSelector(state)?.address;

    if (!address) {
        return [];
    }

    return state.transactions.transactions
        .filter((transaction) =>
            isUnshieldedBalanceTransaction(transaction, address)
        )
        .map(mapNames);
};

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export const loadingTransactionsSelector = (state: RootState) =>
    state.transactions.loadingTransactions;

export const hasMoreTransactionsSelector = (state: RootState) =>
    state.transactions.transactions
        .map((t) => t.id)
        .filter(isDefined)
        .reverse()[0] > state.transactions.lowestTransactionId;

export default transactionSlice.reducer;
