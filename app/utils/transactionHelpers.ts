import { findAccounts } from '../database/AccountDao';
import { findEntries } from '../database/AddressBookDao';
import { getNextAccountNonce, getTransactionStatus } from './client';
import { AccountTransaction, TransactionKind, TimeStampUnit } from './types';
import { sleep } from './httpRequests';

/**
 * Given a GTU amount, convert to microGTU
 */
export function toMicroUnits(amount: number): number {
    return Math.floor(amount * 1000000);
}

/**
 * Given a microGTU amount, returns the same amount in GTU
 * in a displayable format.
 */
export function fromMicroUnits(rawAmount) {
    const amount = parseInt(rawAmount, 10);
    const absolute = Math.abs(amount);
    const GTU = Math.floor(absolute / 1000000);
    const microGTU = absolute % 1000000;
    const microGTUFormatted =
        microGTU === 0
            ? ''
            : `.${'0'.repeat(
                  6 - microGTU.toString().length
              )}${microGTU.toString().replace(/0+$/, '')}`;

    const negative = amount < 0 ? '-' : '';
    return `${negative} \u01E4 ${GTU}${microGTUFormatted}`;
}

/**
 * return highest id of given transactions
 */
export function getHighestId(transactions) {
    return transactions.reduce((id, t) => Math.max(id, t.id), 0);
}

/**
 * Attempts to find the address in the accounts, and then AddressBookEntries
 * If the address is found, return the name, otherwise returns undefined;
 * TODO: if accounts are added to the AddressBook, then only lookup AddressBook.
 */
async function lookupName(address): string {
    const accounts = await findAccounts({ address });
    if (accounts.length > 0) {
        return accounts[0].name;
    }
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
async function attachName(transaction) {
    const toName = await lookupName(transaction.toAddress);
    if (toName) transaction.toAddressName = toName;
    const fromName = await lookupName(transaction.fromAddress);
    if (fromName) transaction.fromAddressName = fromName;
    return transaction;
}

/**
 * AttachName for a list of transaction. See attachName.
 */
export async function attachNames(transactions) {
    return Promise.all(transactions.map(attachName));
}

/**
 * Given a unix timeStamp, return the date in a displayable format.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function parseTime(
    timeStamp,
    unit: TimeStampUnit = TimeStampUnit.seconds
) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(timeStamp * unit));
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export async function createSimpleTransferTransaction(
    fromAddress: string,
    amount: string,
    toAddress: string
) {
    const nonceJSON = await getNextAccountNonce(fromAddress);
    const { nonce } = JSON.parse(nonceJSON.getValue());
    const transferTransaction: AccountTransaction = {
        sender: fromAddress,
        nonce,
        energyAmount: 200, // TODO: Does this need to be set by the user?
        expiry: 16446744073, // TODO: Don't hardcode?
        transactionKind: TransactionKind.Simple_transfer,
        payload: {
            toAddress,
            amount: toMicroUnits(amount),
        },
    };
    return transferTransaction;
}

/**
 *  Monitors the transaction's status, until has been finalized/rejected,
 *  and updates the transaction accordingly.
 */
export async function waitForFinalization(transactionId: string) {
    while (true) {
        const response = await getTransactionStatus(transactionId);
        const data = response.getValue();
        if (data === 'null') {
            return undefined;
        }
        const dataObject = JSON.parse(data);
        const { status } = dataObject;
        if (status === 'finalized') {
            return dataObject;
        }
        await sleep(10000);
    }
}
