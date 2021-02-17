import { findEntries } from '../database/AddressBookDao';
import { getNextAccountNonce, getTransactionStatus } from './client';
import {
    TransactionKindId,
    TransferTransaction,
    SimpleTransfer,
    TransactionEvent,
    TransactionStatus,
} from './types';
/**
 * return highest id of given transactions
 */
export function getHighestId(transactions: TransferTransaction[]) {
    return transactions.reduce((id, t) => Math.max(id, t.id), 0);
}

/**
 * Attempts to find the address in the accounts, and then AddressBookEntries
 * If the address is found, return the name, otherwise returns undefined;
 */
async function lookupName(address: string): Promise<string | undefined> {
    const entries = await findEntries({ address });
    if (entries.length > 0) {
        return entries[0].name;
    }
    return undefined;
}

/**
 * Attempts to find names on the addresses of the transaction, and adds
 * toAddressName/fromAddressName fields, if successful.
 * returns the potentially modified transaction.
 */
async function attachName(
    transaction: TransferTransaction
): Promise<TransferTransaction> {
    const updatedTransaction = { ...transaction };
    const toName = await lookupName(transaction.toAddress);
    if (toName) {
        updatedTransaction.toAddressName = toName;
    }
    const fromName = await lookupName(transaction.fromAddress);
    if (fromName) {
        updatedTransaction.fromAddressName = fromName;
    }
    return updatedTransaction;
}

/**
 * AttachName for a list of transaction. See attachName.
 */
export async function attachNames(
    transactions: TransferTransaction[]
): Promise<TransferTransaction[]> {
    return Promise.all(transactions.map(attachName));
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export async function createSimpleTransferTransaction(
    fromAddress: string,
    amount: BigInt,
    toAddress: string,
    expiry = '16446744073',
    energyAmount = '200'
) {
    const { nonce } = await getNextAccountNonce(fromAddress);
    const transferTransaction: SimpleTransfer = {
        sender: fromAddress,
        nonce,
        energyAmount, // TODO: Does this need to be set by the user?
        expiry, // TODO: Don't hardcode?
        transactionKind: TransactionKindId.Simple_transfer,
        payload: {
            toAddress,
            amount: amount.toString(),
        },
    };
    return transferTransaction;
}

export async function getDataObject(
    transactionHash: string
): Promise<Record<string, TransactionEvent>> {
    const data = (await getTransactionStatus(transactionHash)).getValue();
    if (data === 'null') {
        throw new Error('Unexpected missing data object!');
    }
    return JSON.parse(data);
}

/**
 * Queries the node for the status of the transaction with the provided transaction hash.
 * The polling will continue until the transaction becomes absent or finalized.
 * @param transactionHash the hash of the transaction to get the status for
 * @param pollingIntervalM, optional, interval between polling in milliSeconds, defaults to every 20 seconds.
 */
export async function getStatus(
    transactionHash: string,
    pollingIntervalMs = 20000
): Promise<TransactionStatus> {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            let response;
            try {
                response = (
                    await getTransactionStatus(transactionHash)
                ).getValue();
            } catch (err) {
                // This happens if the node cannot be reached. Just wait for the next
                // interval and try again.
                return;
            }
            if (response === 'null') {
                clearInterval(interval);
                resolve(TransactionStatus.Rejected);
                return;
            }

            const { status } = JSON.parse(response);
            if (status === 'finalized') {
                clearInterval(interval);
                resolve(TransactionStatus.Finalized);
            }
        }, pollingIntervalMs);
    });
}
