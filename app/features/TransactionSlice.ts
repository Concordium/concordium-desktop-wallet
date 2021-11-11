import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    isAnyOf,
    isFulfilled,
} from '@reduxjs/toolkit';
import { Mutex, MutexInterface } from 'async-mutex';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    getTransactionsAscending,
    getTransactionsDescending,
} from '../utils/httpRequests';
import {
    deleteTransaction,
    getFilteredPendingTransactions,
    insertTransactions,
    updateTransaction,
} from '../database/TransactionDao';
import {
    TransferTransaction,
    TransactionStatus,
    AccountTransaction,
    Dispatch,
    TransactionEvent,
    TransferTransactionWithNames,
    Account,
    TransactionKindString,
    IncomingTransaction,
} from '../utils/types';
import {
    isSuccessfulTransaction,
    isShieldedBalanceTransaction,
    isUnshieldedBalanceTransaction,
} from '../utils/transactionHelpers';
import {
    convertIncomingTransaction,
    convertAccountTransaction,
} from '../utils/TransactionConverters';
// eslint-disable-next-line import/no-cycle
import { chosenAccountSelector, updateAllDecrypted } from './AccountSlice';
import { RejectReason } from '~/utils/node/RejectReasonHelper';
import { isDefined, noOp } from '~/utils/basicHelpers';
import { GetTransactionsOutput } from '~/preload/preloadTypes';
import { findEntries } from '~/database/DecryptedAmountsDao';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';

export const transactionLogPageSize = 100;

enum ActionTypePrefix {
    Load = 'transactions/load',
    Update = 'transactions/update',
    Reload = 'transactions/reload',
}

interface LoadTransactionsArgs {
    /**
     * If true, activates loading indicator in transaction list
     */
    showLoading?: boolean;
    /**
     * Append to existing transactions or load as new set of transactions.
     */
    append?: boolean;
    /**
     * Number of transactions to load.
     */
    size?: number;
    /**
     * If this is true, loading more transactions will be locked until this finishes.
     * It will also make the load always run, even though subsequent loads are dispatched before this finishes.
     */
    force?: boolean;
}

let latestLoadingRequestId: string | undefined;
const forceLock = new Mutex();

/**
 * Get any transactions that are newer than the newest transaction in the local state. The
 * transactions are retrieved from the wallet proxy in ascending order, providing it with the
 * current maximum id of a transaction in the local state. The result is reversed to keep the
 * sorting (on id) consistently descending.
 * @param account the account to get new transactions for
 * @param transactions the current transactions in the state
 * @param limit the maximum number of transactions to ask the wallet proxy for
 */
async function getNewTransactions(
    account: Account,
    transactionsInState: TransferTransaction[],
    onlyEncrypted: boolean,
    limit: number
): Promise<TransferTransaction[]> {
    const maxId = transactionsInState
        .map((t) => t.id)
        .filter(isDefined)
        .reduce<string | undefined>(
            (max, cur) => (!max || max < cur ? cur : max),
            undefined
        );

    const transactions: IncomingTransaction[] = [];
    let full = true;
    let currentId = maxId;

    // We have to ask for transactions until there are no more. This is needed as we could
    // receive more than ${limit} transactions in one query to the wallet proxy.
    while (full) {
        const transactionsResponseFromWalletProxy = await getTransactionsAscending(
            account.address,
            account.transactionFilter,
            onlyEncrypted,
            limit,
            currentId
        );

        transactions.push(...transactionsResponseFromWalletProxy.transactions);
        if (transactionsResponseFromWalletProxy.transactions.length === 0) {
            full = false;
        } else {
            currentId =
                transactionsResponseFromWalletProxy.transactions[
                    transactionsResponseFromWalletProxy.transactions.length - 1
                ].id;
            full = transactionsResponseFromWalletProxy.full;
        }
    }

    const transactionsInLocalFormat = transactions.map((txn) =>
        convertIncomingTransaction(txn, account.address)
    );
    const transactionsInDescendingOrder = transactionsInLocalFormat.reverse();
    return transactionsInDescendingOrder;
}

/**
 * Enriches any encrypted transfers (with or without memo) with decrypted amounts, if they
 * have previously been decrypted and had their amounts stored locally in the database.
 * @param transactions an array of transactions from the wallet proxy
 * @returns the transactions enriched with decrypted amounts, and a boolean indicating whether we had decrypted amounts for all the encrypted transfers
 */
async function enrichWithDecryptedAmounts(
    transactions: TransferTransaction[]
): Promise<{
    withDecryptedAmounts: TransferTransaction[];
    allDecrypted: boolean;
}> {
    const encryptedTypes = [
        TransactionKindString.EncryptedAmountTransfer,
        TransactionKindString.EncryptedAmountTransferWithMemo,
    ];

    const encryptedTransactions = transactions.filter((t) =>
        encryptedTypes.includes(t.transactionKind)
    );
    const decryptedAmounts = await findEntries(
        encryptedTransactions.map(
            (encryptedTransaction) => encryptedTransaction.transactionHash
        )
    );

    let allDecrypted = true;
    const withDecryptedAmounts = transactions.map((t) => {
        if (!encryptedTypes.includes(t.transactionKind)) {
            return t;
        }

        const amount = decryptedAmounts.find(
            (decrypted) => decrypted.transactionHash === t.transactionHash
        )?.amount;
        if (amount) {
            return {
                ...t,
                decryptedAmount: amount,
            };
        }
        allDecrypted = false;
        return t;
    });
    return { withDecryptedAmounts, allDecrypted };
}

/**
 * Load transactions from the wallet proxy and pending transactions
 * from the database. The transactions retrieved are filtered according
 * to the account's filter.
 */
export const loadTransactions = createAsyncThunk(
    ActionTypePrefix.Load,
    async (
        {
            append = false,
            size = transactionLogPageSize,
            force = false,
        }: LoadTransactionsArgs,
        { getState, dispatch, requestId, signal }
    ) => {
        const state = getState() as RootState;
        const account = chosenAccountSelector(state);

        if (!account) {
            throw new Error('No account');
        }

        let release: MutexInterface.Releaser | undefined;
        if (force) {
            release = await forceLock.acquire();
        }

        const rejectIfInvalid = (reason: string) => {
            if (
                signal.aborted ||
                (requestId !== latestLoadingRequestId && !force)
            ) {
                release?.();
                throw new Error(reason);
            }
        };

        const minId = state.transactions.transactions
            .map((t) => t.id)
            .filter(isDefined)
            .reduce<string | undefined>(
                (min, cur) => (!min || min > cur ? cur : min),
                undefined
            );

        rejectIfInvalid('DB load aborted');

        try {
            rejectIfInvalid('Redux load aborted');

            const transactionsResponseFromWalletProxy = await getTransactionsDescending(
                account.address,
                account.transactionFilter,
                state.transactions.viewingShielded,
                size,
                append ? minId : undefined
            );
            const transactions = transactionsResponseFromWalletProxy.transactions.map(
                (txn) => convertIncomingTransaction(txn, account.address)
            );

            const {
                withDecryptedAmounts,
                allDecrypted,
            } = await enrichWithDecryptedAmounts(transactions);
            if (!allDecrypted) {
                await updateAllDecrypted(dispatch, account.address, false);
            }

            // We only want to load pending transactions that are not also received
            // from the wallet proxy. There can be such transactions as the confirmation
            // of sent transactions happens asynchronously from the loading of transactions.
            let pendingTransactions: TransferTransaction[] = [];
            if (!append) {
                const hashesFromProxy = withDecryptedAmounts.map(
                    (t) => t.transactionHash
                );
                const { fromDate, toDate } = account.transactionFilter;
                const booleanFilters = getActiveBooleanFilters(
                    account.transactionFilter
                );
                pendingTransactions = (
                    await getFilteredPendingTransactions(
                        account.address,
                        booleanFilters,
                        fromDate ? new Date(fromDate) : undefined,
                        toDate ? new Date(toDate) : undefined
                    )
                ).filter(
                    (pendingTransaction) =>
                        !hashesFromProxy.includes(
                            pendingTransaction.transactionHash
                        )
                );
            }

            return {
                transactions: [...pendingTransactions, ...withDecryptedAmounts],
                more: transactionsResponseFromWalletProxy.full,
            };
        } finally {
            // Push release of lock to end of async queue, as this will wait for redux to update with loaded transactions.
            setTimeout(() => release?.());
        }
    }
);

export const loadNewTransactions = createAsyncThunk(
    ActionTypePrefix.Update,
    async (
        { size = transactionLogPageSize }: LoadTransactionsArgs,
        { getState, dispatch }
    ) => {
        const state = getState() as RootState;
        const account = chosenAccountSelector(state);

        if (!account) {
            throw new Error('No account');
        }

        const transactions = await getNewTransactions(
            account,
            state.transactions.transactions,
            state.transactions.viewingShielded,
            size
        );

        // Filter out any transactions that are already in the state.
        // This can be the case for e.g. outgoing transactions that are
        // added to the transaction state when sending them.
        const existingHashes = state.transactions.transactions.map(
            (t) => t.transactionHash
        );
        // We keep all transactions with an undefined transaction hash,
        // as they are all rewards (which cannot be created by the wallet).
        const newTransactions = transactions.filter(
            (t) =>
                t.transactionHash === undefined ||
                !existingHashes.includes(t.transactionHash)
        );

        const {
            withDecryptedAmounts,
            allDecrypted,
        } = await enrichWithDecryptedAmounts(newTransactions);
        if (!allDecrypted) {
            await updateAllDecrypted(dispatch, account.address, false);
        }

        return { transactions: withDecryptedAmounts };
    }
);

/**
 * Reloads the transaction state entirely by retrieving it from
 * the wallet proxy, i.e. the state is cleared and replaced by
 * the transactions received.
 */
export const reloadTransactions = createAsyncThunk(
    ActionTypePrefix.Reload,
    async (_, { dispatch, getState, signal }) => {
        // If a forced load is running, wait for it to finish, to reload with updated length of transactions.
        await forceLock.waitForUnlock();

        const state = getState() as RootState;
        const { transactions } = state.transactions;
        const account = chosenAccountSelector(state);

        if (!account) {
            return;
        }

        const load = dispatch(
            loadTransactions({
                size: Math.max(transactions.length, transactionLogPageSize),
            })
        );

        signal.onabort = () => load.abort();
        await load;
    }
);

interface State {
    transactions: TransferTransaction[];
    viewingShielded: boolean;
    loadingTransactions: boolean;
    hasMore: boolean;
    synchronizing: boolean;
}

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
        loadingTransactions: false,
        hasMore: false,
        synchronizing: false,
    } as State,
    reducers: {
        setTransactions(state, update: PayloadAction<GetTransactionsOutput>) {
            state.transactions = update.payload.transactions;
            state.hasMore = update.payload.more;
        },
        setViewingShielded(state, viewingShielded) {
            state.viewingShielded = viewingShielded.payload;
        },
        setHasMore(state, hasMore) {
            state.hasMore = hasMore.payload;
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
    extraReducers: (builder) => {
        builder.addCase(loadTransactions.pending, (state, action) => {
            const { requestId } = action.meta;
            latestLoadingRequestId = requestId;

            if (action.meta.arg.showLoading) {
                state.loadingTransactions = true;
            }
        });

        builder.addMatcher(
            isAnyOf(loadNewTransactions.fulfilled),
            (state: State, action) => {
                if (action.payload.transactions.length > 0) {
                    const newTransactions = action.payload.transactions;
                    newTransactions.push(...state.transactions);
                    state.transactions = newTransactions;
                }
            }
        );

        builder.addMatcher(
            isAnyOf(loadTransactions.rejected, loadTransactions.fulfilled),
            (state: State, action) => {
                const isLatest =
                    action.meta.requestId === latestLoadingRequestId;

                if (isFulfilled(action)) {
                    state.hasMore = action.payload.more;

                    if (action.meta.arg.append) {
                        state.transactions.push(...action.payload.transactions);
                    } else {
                        state.transactions = action.payload.transactions;
                    }
                }

                if (isLatest) {
                    state.loadingTransactions = false;
                }
            }
        );

        builder.addDefaultCase(noOp);
    },
});

export const {
    setViewingShielded,
    updateTransactionFields,
} = transactionSlice.actions;

const { setTransactions, setHasMore } = transactionSlice.actions;

export const resetTransactions = () =>
    setTransactions({ transactions: [], more: false });

export const setViewingShieldedExternal = (
    dispatch: Dispatch,
    value: boolean
) => {
    resetTransactions();
    dispatch(setHasMore(false));
    dispatch(setViewingShielded(value));
};

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
 * Updates the transaction's status to confirmed in the state, and updates
 * its cost depending on whether it succeeded or not. The transaction is
 * removed from the local database, as a finalized transaction is available
 * to us on the wallet proxy.
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

    await deleteTransaction(transactionHash);

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

export const shieldedTransactionsSelector = (
    state: RootState
): TransferTransactionWithNames[] => {
    const mapNames = attachNames(state);
    return state.transactions.transactions
        .filter(isShieldedBalanceTransaction)
        .map(mapNames);
};

export const viewingShieldedSelector = (state: RootState) =>
    state.transactions.viewingShielded;

export const loadingTransactionsSelector = (state: RootState) =>
    state.transactions.loadingTransactions;

export const hasMoreTransactionsSelector = (state: RootState) =>
    state.transactions.hasMore;

export default transactionSlice.reducer;
