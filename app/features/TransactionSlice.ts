import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getNewestTransactions, getTransactions } from '../utils/httpRequests';
import { decryptAmounts } from '../utils/rustInterface';
import {
    getTransactionsOfAccount,
    insertTransactions,
    updateTransaction,
    getTransaction,
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
import { max } from '~/utils/basicHelpers';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import errorMessages from '~/constants/errorMessages.json';
import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';

const updateTransactionInterval = 5000;
export const transactionLogPageSize = 100;

interface State {
    transactions: TransferTransaction[];
    viewingShielded: boolean;
    loadingTransactions: boolean;
}

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
        loadingTransactions: false,
    } as State,
    reducers: {
        setTransactions(state, update: PayloadAction<TransferTransaction[]>) {
            state.transactions = update.payload;
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
    transactions: TransferTransaction[],
    accountAddress: string,
    prfKey: string,
    credentialNumber: number,
    global: Global
) {
    const encryptedTransfers = transactions.filter(
        (t) =>
            [
                TransactionKindString.EncryptedAmountTransfer,
                TransactionKindString.EncryptedAmountTransferWithMemo,
            ].includes(t.transactionKind) &&
            t.decryptedAmount === null &&
            t.status === TransactionStatus.Finalized
    );

    if (encryptedTransfers.length === 0) {
        return Promise.resolve();
    }

    const encryptedAmounts = encryptedTransfers.map((t) => {
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

/**
 * Load transactions from storage.
 * Filters out reward transactions based on the account's transaction filter.
 */
export async function loadTransactions(
    account: Account,
    dispatch: Dispatch,
    showLoading = false,
    controller?: AbortController,
    from = 0,
    size = transactionLogPageSize
) {
    if (showLoading) {
        dispatch(setLoadingTransactions(true));
    }

    const { fromDate, toDate } = account.transactionFilter;
    const booleanFilters = getActiveBooleanFilters(account.transactionFilter);
    const transactions = await getTransactionsOfAccount(
        account,
        booleanFilters,
        fromDate ? new Date(fromDate) : undefined,
        toDate ? new Date(toDate) : undefined,
        size,
        from
    );

    if (!controller?.isAborted) {
        if (showLoading) {
            dispatch(setLoadingTransactions(false));
        }

        if (from === 0) {
            dispatch(setTransactions(transactions));
        } else {
            dispatch(appendTransactions(transactions));
        }
    }
}

/**
 * Fetches a batch of the newest transactions of the given account,
 * and saves them to the database, and updates the allDecrypted,
 * if any shielded balance transaction were loaded.
 * N.B. does not load reward transactions.
 */
export async function fetchNewestTransactions(
    dispatch: Dispatch,
    account: Account
) {
    const newestTransactionInDatabase = await getTransaction(
        account.maxTransactionId
    );

    if (
        account.transactionFilter.toDate &&
        secondsSinceUnixEpoch(
            new Date(account.transactionFilter.toDate)
        ).toString() < newestTransactionInDatabase.blockTime
    ) {
        // The area of search is subset of loaded transactions.
        return;
    }

    const transactions = await getNewestTransactions(
        account.address,
        account.transactionFilter
    );

    const newTransactions = await insertTransactions(
        transactions.map((transaction) =>
            convertIncomingTransaction(transaction, account.address)
        )
    );
    if (newTransactions.some(isShieldedBalanceTransaction)) {
        await updateAllDecrypted(dispatch, account.address, false);
    }
}

/**
 * Fetches a batch of transactions on the given address, from the given currentMaxId.
 * and saves them to the database.
 * @return An object containing:
 * - newMaxId is the largest id among the fetched transactions)
 * - isFinished is whether the transactions were the account's latests, or there are more to fetch.
 * - newEncrypted is whether any shielded balance transactions were fetched.
 */
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
 * @param controller this controls the function, and if it is aborted, this will terminate when able.
 * @param outdatedController A controller which is assumed to be already started, and should only become ready, when the wallet has an outdated view of the current account's transactions. Additionally it becomes busy again, when this finishes, and the view is up to date
 */
export async function updateTransactions(
    dispatch: Dispatch,
    account: Account,
    controller: AbortController,
    outdatedController: AbortController
) {
    return new Promise<void>((resolve, reject) => {
        function finish() {
            // call start on the outdatedController, to indicate that the transactions are no longer outdated.
            outdatedController.start();
            controller.finish();
            resolve();
        }

        async function updateSubroutine(maxId: bigint) {
            if (controller.isAborted) {
                finish();
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
                finish();
                return;
            }
            if (maxId !== result.newMaxId && !result.isFinished) {
                // call finish on the outdatedController, to indicate that the transactions are outdated.
                outdatedController.finish();
                setTimeout(
                    updateSubroutine,
                    updateTransactionInterval,
                    result.newMaxId
                );
                return;
            }
            finish();
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

export default transactionSlice.reducer;
