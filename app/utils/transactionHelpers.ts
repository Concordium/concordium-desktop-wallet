import { findAccounts } from '../database/AccountDao';
import { findEntries } from '../database/AddressBookDao';

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
    return `${negative} G ${GTU}${microGTUFormatted}`;
}

export function getHighestId(transactions) {
    return transactions.reduce((id, t) => Math.max(id, t.id), 0);
}

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

async function attachName(transaction) {
    const toName = await lookupName(transaction.toAddress);
    if (toName) transaction.toAddressName = toName;
    const fromName = await lookupName(transaction.fromAddress);
    if (fromName) transaction.fromAddressName = fromName;
    return transaction;
}

export async function attachNames(transactions) {
    return Promise.all(transactions.map(attachName));
}
