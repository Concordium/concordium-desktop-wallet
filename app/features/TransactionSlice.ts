import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    isAnyOf,
    isFulfilled,
} from '@reduxjs/toolkit';
import { Mutex, MutexInterface } from 'async-mutex';
import {
    AccountTransactionSummary,
    TransactionKindString,
} from '@concordium/web-sdk';
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
    TransferTransactionWithNames,
    Account,
    IncomingTransaction,
    TransactionFilter,
    BooleanFilters,
    OriginType,
} from '../utils/types';
import {
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
import { isDefined, noOp, throwLoggedError } from '~/utils/basicHelpers';
import { GetTransactionsOutput } from '~/preload/preloadTypes';
import { findEntries } from '~/database/DecryptedAmountsDao';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import errorMessages from '~/constants/errorMessages.json';
import isSuccessfulEncryptedTransaction from '~/utils/decryptHelpers';

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
    /**
     * If true only shielded transactions will be loaded.
     */
    onlyLoadShielded: boolean;
}

let latestLoadingRequestId: string | undefined;
const forceLock = new Mutex();

/**
 * Converts a filter into a filter that only includes transaction
 * types that affect the shielded balance.
 * @param filter the transaction filter to convert
 */
function shieldedOnlyFilter(filter: TransactionFilter): TransactionFilter {
    // We use this required type to ensure that if a new transaction type
    // is added, then the compiler will complain.
    const allFalseFilter: Required<BooleanFilters> = {
        encryptedAmountTransfer: false,
        encryptedAmountTransferWithMemo: false,
        transferToEncrypted: false,
        transferToPublic: false,
        addBaker: false,
        bakingReward: false,
        blockReward: false,
        deployModule: false,
        finalizationReward: false,
        initContract: false,
        registerData: false,
        removeBaker: false,
        transfer: false,
        transferWithMemo: false,
        transferWithSchedule: false,
        transferWithScheduleAndMemo: false,
        update: false,
        updateBakerKeys: false,
        updateCredentials: false,
        updateCredentialKeys: false,
        updateBakerStake: false,
        updateBakerRestakeEarnings: false,
        configureBaker: false,
        configureDelegation: false,
        paydayAccountReward: false,
        failed: false,
        tokenUpdate: false,
    };

    return {
        ...allFalseFilter,
        encryptedAmountTransfer: filter.encryptedAmountTransfer,
        encryptedAmountTransferWithMemo: filter.encryptedAmountTransferWithMemo,
        transferToEncrypted: filter.transferToEncrypted,
        transferToPublic: filter.transferToPublic,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
    };
}

/**
 * Get any transactions that are newer than the newest transaction in the local state. The
 * transactions are retrieved from the wallet proxy in ascending order, providing it with the
 * current maximum id of a transaction in the local state. The result is reversed to keep the
 * sorting (on id) consistently descending.
 * @param account the account to get new transactions for
 * @param transactions the current transactions in the state, assumed to be sorted descendingly
 * @param limit the maximum number of transactions to ask the wallet proxy for
 * @param onlyLoadShielded whether the transactions that should be retrieved are shielded transactions or not
 */
async function getNewTransactions(
    account: Account,
    transactionsInState: TransferTransaction[],
    limit: number,
    onlyLoadShielded: boolean
): Promise<TransferTransaction[]> {
    // As the transactions in the state are in descending order on their id, the maxId
    // can be found as the first item with an id (if any exist).
    const maxId = transactionsInState.find(
        (t) => t.id !== undefined && t.id !== null
    )?.id;

    const transactions: IncomingTransaction[] = [];
    let full = true;
    let currentMaxId = maxId;
    const filter = onlyLoadShielded
        ? shieldedOnlyFilter(account.transactionFilter)
        : account.transactionFilter;

    // We have to ask for transactions until there are no more. This is needed as we could
    // receive more than ${limit} transactions in one query to the wallet proxy.
    while (full) {
        const transactionsResponseFromWalletProxy = await getTransactionsAscending(
            account.address,
            filter,
            limit,
            currentMaxId
        );

        transactions.push(...transactionsResponseFromWalletProxy.transactions);
        if (transactionsResponseFromWalletProxy.transactions.length === 0) {
            full = false;
        } else {
            currentMaxId = transactionsResponseFromWalletProxy.maxId;
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
    const encryptedTransactions = transactions.filter(
        isSuccessfulEncryptedTransaction
    );
    const decryptedAmounts = await findEntries(
        encryptedTransactions.map(
            (encryptedTransaction) => encryptedTransaction.transactionHash
        )
    );

    let allDecrypted = true;
    const withDecryptedAmounts = transactions.map((t) => {
        if (!isSuccessfulEncryptedTransaction(t)) {
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

async function getTransactions(
    accountAddress: string,
    accountFilter: TransactionFilter,
    size: number,
    fromMinId: string | undefined,
    rejectIfInvalid: (reason: string) => void,
    loadShielded: boolean
): Promise<{ transactions: TransferTransaction[]; more: boolean }> {
    const loadedTransactions: IncomingTransaction[] = [];
    let fetchMore = true;
    let fullResult = false;
    let currentMinId = fromMinId;

    const filter = loadShielded
        ? shieldedOnlyFilter(accountFilter)
        : accountFilter;

    try {
        while (fetchMore) {
            rejectIfInvalid(
                'Load of transactions from wallet proxy has been aborted.'
            );
            const {
                transactions,
                full,
                minId,
            } = await getTransactionsDescending(
                accountAddress,
                filter,
                size,
                currentMinId
            );

            // If NOT loading shielded transactions, then we have to remove all shielded transfers that
            // the account did not send. Only the ones where the account was the sender are shown (to show their cost).
            if (!loadShielded) {
                const transactionsWithoutIncomingShielded = transactions.filter(
                    (t) =>
                        ![
                            TransactionKindString.EncryptedAmountTransfer,
                            TransactionKindString.EncryptedAmountTransferWithMemo,
                        ].includes(t.details.type) ||
                        t.origin.type === OriginType.Self
                );
                loadedTransactions.push(...transactionsWithoutIncomingShielded);
            } else {
                loadedTransactions.push(...transactions);
            }

            // If we got a full page from the wallet proxy, but after filtering it did not
            // result in a full local page, then we have to gather more transactions.
            if (full && loadedTransactions.length < size) {
                currentMinId = minId;
            } else {
                // In this case we either received all possible transactions from the wallet proxy
                // with the currently applied filter, or the page was a full page where no transaction
                // was filtered on our application side. This means we can stop.
                fetchMore = false;

                // Save whether there are more transactions that could be fetched if wanted.
                fullResult = full;
            }
        }
    } catch (e) {
        throw new Error(errorMessages.unableToReachWalletProxy);
    }

    const transactions = loadedTransactions.map((t) =>
        convertIncomingTransaction(t, accountAddress)
    );

    return { transactions, more: fullResult };
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
            onlyLoadShielded,
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

        // The array of transactions is sorted in descending order on the id. Therefore the
        // minimum id can be found as the final transaction in the array.
        const transactionIdArray = state.transactions.transactions
            .map((t) => t.id)
            .filter(isDefined);
        const minId = transactionIdArray[transactionIdArray.length - 1];

        try {
            const { transactions, more } = await getTransactions(
                account.address,
                account.transactionFilter,
                size,
                append ? minId : undefined,
                rejectIfInvalid,
                onlyLoadShielded
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
                more,
            };
        } finally {
            // Push release of lock to end of async queue, as this will wait for redux to update with loaded transactions.
            setTimeout(() => release?.());
        }
    }
);

export const loadNewTransactions = createAsyncThunk(
    ActionTypePrefix.Update,
    async (input: { onlyLoadNewShielded: boolean }, { getState, dispatch }) => {
        const state = getState() as RootState;
        const account = chosenAccountSelector(state);

        if (!account) {
            throw new Error('No account');
        }

        const transactions = await getNewTransactions(
            account,
            state.transactions.transactions,
            transactionLogPageSize,
            input.onlyLoadNewShielded
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
    async (
        input: { onlyLoadShielded: boolean },
        { dispatch, getState, signal }
    ) => {
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
                onlyLoadShielded: input.onlyLoadShielded,
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

export const setViewingShieldedAndReset = (
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
    summary: AccountTransactionSummary
) {
    let status = TransactionStatus.Finalized;
    let rejectReason;

    if (summary.transactionType === TransactionKindString.Failed) {
        status = TransactionStatus.Failed;
        const rejectReasonContent = summary.rejectReason;
        if (!rejectReasonContent) {
            throwLoggedError('Missing rejection reason in transaction event');
        }

        rejectReason =
            RejectReason[rejectReasonContent.tag as keyof typeof RejectReason];
        if (rejectReason === undefined) {
            // If the reject reason was not known, then just store it directly as a string anyway.
            rejectReason = rejectReasonContent.tag;
        }
    }

    const update = {
        status,
        cost: summary.cost.toString(),
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
