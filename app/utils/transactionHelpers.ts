import { findAccounts } from '../database/AccountDao';
import { findEntries } from '../database/AddressBookDao';
import { getNextAccountNonce, getTransactionStatus } from './client';
import {
    AccountTransaction,
    TransactionKindId,
    TransferTransaction,
} from './types';
import { sleep } from './httpRequests';
/**
 * return highest id of given transactions
 */
export function getHighestId(transactions: TransferTransaction[]) {
    return transactions.reduce((id, t) => Math.max(id, t.id), 0);
}

/**
 * Attempts to find the address in the accounts, and then AddressBookEntries
 * If the address is found, return the name, otherwise returns undefined;
 * TODO: when accounts are added to the AddressBook, then only lookup AddressBook.
 */
async function lookupName(address: string): Promise<string | undefined> {
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
    const nonceJSON = await getNextAccountNonce(fromAddress);
    const { nonce } = JSON.parse(nonceJSON.getValue());
    const transferTransaction: AccountTransaction = {
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

/**
 *  Monitors the transaction's status, until has been finalized/rejected,
 *  and updates the transaction accordingly.
 */
export async function waitForFinalization(transactionId: string) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-await-in-loop
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
        // eslint-disable-next-line no-await-in-loop
        await sleep(10000);
    }
}
