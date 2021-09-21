import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    isAnyOf,
} from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getTransactions } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getTransactionsOfAccount,
    upsertTransactionsAndUpdateMaxId,
    insertTransactions,
    updateTransaction,
} from '../database/TransactionDao';
import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    AccountTransaction,
    Dispatch,
    TransactionEvent,
    Global,
    TransferTransactionWithNames,
    IncomingTransaction,
    Account,
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
import { isDefined, max, noOp } from '~/utils/basicHelpers';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import errorMessages from '~/constants/errorMessages.json';
import { GetTransactionsOutput } from '~/preload/preloadTypes';

export const transactionLogPageSize = 100;

enum ActionTypePrefix {
    Load = 'transactions/load',
    Update = 'transactions/update',
    Reload = 'transactions/reload',
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
    ActionTypePrefix.Load,
    async (
        {
            append = false,
            size = transactionLogPageSize,
            controller,
        }: LoadTransactionsArgs,
        { getState }
    ) => {
        const state = getState() as RootState;
        const account = chosenAccountSelector(state);

        if (!account) {
            throw new Error('No account');
        }

        const minId = state.transactions.transactions
            .map((t) => t.id)
            .filter(isDefined)
            .reduce<string | undefined>(
                (min, cur) => (!min || min > cur ? cur : min),
                undefined
            );

        const { fromDate, toDate } = account.transactionFilter;
        const booleanFilters = getActiveBooleanFilters(
            account.transactionFilter
        );
        const result = await getTransactionsOfAccount(
            account,
            booleanFilters,
            fromDate ? new Date(fromDate) : undefined,
            toDate ? new Date(toDate) : undefined,
            size,
            append ? minId : undefined
        );

        if (controller?.isAborted) {
            throw new Error('Load aborted');
        }

        return result;
    }
);

export const reloadTransactions = createAsyncThunk(
    ActionTypePrefix.Reload,
    async (controller: AbortController | undefined, { dispatch, getState }) => {
        const state = getState() as RootState;
        const { transactions } = state.transactions;
        const account = chosenAccountSelector(state);

        if (!account) {
            return;
        }

        await dispatch(
            loadTransactions({
                controller,
                size: Math.max(transactions.length, transactionLogPageSize),
            })
        );
    }
);

/**
 * Fetches a batch of transactions from the wallet proxy for the account
 * with the provided address.
 * @param address the account address to fetch transactions for
 * @param currentMaxId the current transaction id to retrieve transactions from
 * @returns the list of fetched transactions, and the new max id of the received transactions,
 * and whether there are more transactions to fetch.
 */
async function fetchTransactions(
    address: string,
    currentMaxId: bigint
): Promise<{
    transactions: IncomingTransaction[];
    newMaxId: bigint;
    isFinished: boolean;
}> {
    const { transactions, full } = await getTransactions(
        address,
        currentMaxId.toString()
    );

    const newMaxId = transactions.reduce(
        (id, t) => max(id, BigInt(t.id)),
        currentMaxId
    );
    const isFinished = !full;

    return { transactions, newMaxId, isFinished };
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

interface UpdateTransactionsArgs {
    controller: AbortController;
    onError(e: string): void;
}

/** Update the transactions from remote source.
 * will fetch transactions in intervals, updating the state each time.
 * stops when it reaches the newest transaction, or it is told to abort by the controller.
 * */
export const updateTransactions = createAsyncThunk<
    unknown,
    UpdateTransactionsArgs
>(
    ActionTypePrefix.Update,
    async ({ controller, onError }, { getState, dispatch }) => {
        const state = getState() as RootState;
        const account = chosenAccountSelector(state);

        if (!account) {
            return;
        }

        async function updateSubroutine(maxId: bigint) {
            if (!account) {
                throw new Error('Account missing');
            }

            if (controller.isAborted) {
                throw new Error('Update aborted');
            }

            let result;
            const { address } = account;
            try {
                result = await fetchTransactions(address, maxId);
            } catch (e) {
                onError(errorMessages.unableToReachWalletProxy);
                throw e;
            }

            // Insert the fetched transactions and update the max transaction id
            // in a single transaction.
            const convertedIncomingTransactions = result.transactions.map((t) =>
                convertIncomingTransaction(t, address)
            );
            const newTransactions = await upsertTransactionsAndUpdateMaxId(
                convertedIncomingTransactions,
                address,
                result.newMaxId
            );
            await updateMaxTransactionId(
                dispatch,
                address,
                result.newMaxId.toString()
            );

            const newEncrypted = newTransactions.some(
                isShieldedBalanceTransaction
            );
            if (newEncrypted) {
                await updateAllDecrypted(dispatch, address, false);
            }

            if (controller.isAborted) {
                throw new Error('Update aborted');
            }

            const maxIdInStore = state.transactions.transactions
                .map((t) => t.id)
                .filter(isDefined)
                .reduce<string | undefined>(
                    (top, cur) => (!!top && top > cur ? top : cur),
                    undefined
                );

            if (maxIdInStore !== result.newMaxId.toString()) {
                dispatch(reloadTransactions(controller));
            }

            if (maxId === result.newMaxId || result.isFinished) {
                return;
            }

            await updateSubroutine(result.newMaxId);
        }

        await updateSubroutine(
            account.maxTransactionId ? BigInt(account.maxTransactionId) : 0n
        );
    }
);

interface State {
    transactions: TransferTransaction[];
    viewingShielded: boolean;
    loadingTransactions: boolean;
    hasMore: boolean;
    syncronizing: boolean;
}

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
        loadingTransactions: false,
        hasMore: false,
        syncronizing: false,
    } as State,
    reducers: {
        setTransactions(state, update: PayloadAction<GetTransactionsOutput>) {
            state.transactions = update.payload.transactions;
            state.hasMore = update.payload.more;
        },
        setViewingShielded(state, viewingShielded) {
            state.viewingShielded = viewingShielded.payload;
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
            if (action.meta.arg.showLoading) {
                state.loadingTransactions = true;
            }
        });

        builder.addCase(updateTransactions.pending, (state) => {
            state.syncronizing = true;
        });

        builder.addCase(loadTransactions.rejected, (state) => {
            state.loadingTransactions = false;
        });

        builder.addCase(loadTransactions.fulfilled, (state, action) => {
            const { controller, append = false } = action.meta.arg;

            if (controller?.isAborted) {
                return;
            }

            state.hasMore = action.payload.more;
            state.loadingTransactions = false;

            if (append) {
                state.transactions.push(...action.payload.transactions);
            } else {
                state.transactions = action.payload.transactions;
            }
        });

        builder.addMatcher(
            isAnyOf(updateTransactions.rejected, updateTransactions.fulfilled),
            (state) => {
                state.syncronizing = false;
            }
        );

        builder.addDefaultCase(noOp);
    },
});

export const { setViewingShielded } = transactionSlice.actions;

const { setTransactions, updateTransactionFields } = transactionSlice.actions;

export const resetTransactions = () =>
    setTransactions({ transactions: [], more: false });

// Decrypts the encrypted transfers in the given transacion list, using the prfKey.
// This function expects the prfKey to match the account's prfKey,
// and that the account is the receiver of the transactions.
export async function decryptTransactions(
    account: Account,
    prfKey: string,
    credentialNumber: number,
    global: Global
) {
    const {
        transactions: encryptedTransfers,
    } = await getTransactionsOfAccount(account, [
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
        if (t.fromAddress === account.address) {
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
    state.transactions.hasMore;

export default transactionSlice.reducer;
