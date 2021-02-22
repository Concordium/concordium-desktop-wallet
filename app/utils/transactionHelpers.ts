import { findEntries } from '../database/AddressBookDao';
import { getNextAccountNonce, getTransactionStatus } from './nodeRequests';
import { getDefaultExpiry } from './timeHelpers';
import {
    TransactionKindId,
    TransferTransaction,
    SimpleTransfer,
    TransactionEvent,
    TransactionStatus,
    ScheduledTransfer,
    SchedulePoint,
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
export async function lookupName(address: string): Promise<string | undefined> {
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
    expiry: string = getDefaultExpiry(),
    energyAmount = '200'
) {
    const { nonce } = await getNextAccountNonce(fromAddress);
    const transferTransaction: SimpleTransfer = {
        sender: fromAddress,
        nonce,
        energyAmount, // TODO: Does this need to be set by the user?
        expiry,
        transactionKind: TransactionKindId.Simple_transfer,
        payload: {
            toAddress,
            amount: amount.toString(),
        },
    };
    return transferTransaction;
}

export function createRegularIntervalSchedule(
    totalAmount: bigint,
    releases: number,
    starting: number,
    interval: number
): SchedulePoint[] {
    const releaseAmount = totalAmount / BigInt(releases);
    const restAmount = totalAmount % BigInt(releases);
    const schedule = [];
    let timestamp = starting;
    for (let i = 0; i < releases - 1; i += 1) {
        schedule.push({
            amount: releaseAmount.toString(),
            timestamp: timestamp.toString(),
        });
        timestamp += interval;
    }
    schedule.push({
        amount: (releaseAmount + restAmount).toString(),
        timestamp: timestamp.toString(),
    });
    return schedule;
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export async function createScheduledTransferTransaction(
    fromAddress: string,
    toAddress: string,
    schedule: SchedulePoint[],
    expiry: string = getDefaultExpiry(),
    energyAmount = '20000'
) {
    const { nonce } = await getNextAccountNonce(fromAddress);
    const transferTransaction: ScheduledTransfer = {
        sender: fromAddress,
        nonce,
        energyAmount, // TODO: Does this need to be set by the user?
        expiry,
        transactionKind: TransactionKindId.Transfer_with_schedule,
        payload: {
            toAddress,
            schedule,
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

export function getScheduledTransferAmount(
    transaction: ScheduledTransfer
): bigint {
    return transaction.payload.schedule.reduce(
        (total, point) => total + BigInt(point.amount),
        0n
    );
}

export function isFailed(transaction: TransferTransaction) {
    return (
        transaction.success === false ||
        transaction.success === 0 ||
        transaction.status === TransactionStatus.Rejected
    );
}
