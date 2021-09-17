import { createSlice } from '@reduxjs/toolkit';
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
    Account,
    AccountTransaction,
    Dispatch,
    TransactionEvent,
    Global,
    TransferTransactionWithNames,
    IncomingTransaction,
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
import errorMessages from '~/constants/errorMessages.json';

interface State {
    transactions: TransferTransaction[];
    viewingShielded: boolean;
    moreTransactions: boolean;
    loadingTransactions: boolean;
}

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        viewingShielded: false,
        moreTransactions: false,
        loadingTransactions: false,
    } as State,
    reducers: {
        setTransactions(state, update) {
            state.transactions = update.payload.transactions;
            state.moreTransactions = update.payload.more;
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
 * Filters out reward transactions based on the account's rewardFilter.
 */
export async function loadTransactions(
    account: Account,
    dispatch: Dispatch,
    showLoading = false,
    controller?: AbortController
) {
    if (showLoading) {
        dispatch(setLoadingTransactions(true));
    }
    const { transactions, more } = await getTransactionsOfAccount(
        account,
        JSON.parse(account.rewardFilter)
    );

    if (!controller?.isAborted) {
        if (showLoading) {
            dispatch(setLoadingTransactions(false));
        }
        dispatch(setTransactions({ transactions, more }));
    }
}

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
 * Fetches transactions from the wallet proxy, inserts them into the
 * local database and updates the state with the updated information.
 * Stops when the newest transaction has been reached, or if it is told
 * to abort by the controller.
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
            const { address } = account;
            try {
                result = await fetchTransactions(address, maxId);
            } catch (e) {
                controller.finish();
                reject(errorMessages.unableToReachWalletProxy);
                return;
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
                controller.finish();
                resolve();
                return;
            }
            if (maxId !== result.newMaxId) {
                const accountWithUpdateMaxId = {
                    ...account,
                    maxTransactionId: result.newMaxId.toString(),
                };

                await loadTransactions(accountWithUpdateMaxId, dispatch);
                if (!result.isFinished) {
                    updateSubroutine(result.newMaxId);
                    return;
                }
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

export const moreTransactionsSelector = (state: RootState) =>
    state.transactions.moreTransactions;

export const loadingTransactionsSelector = (state: RootState) =>
    state.transactions.loadingTransactions;

export default transactionSlice.reducer;
