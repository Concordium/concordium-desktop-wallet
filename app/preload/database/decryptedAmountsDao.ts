import { DecryptedAmount } from '~/utils/types';
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import { DecryptedAmountsMethods } from '../preloadTypes';

async function insert(entry: DecryptedAmount) {
    return (await knex())(databaseNames.decryptedAmountsTable).insert(entry);
}

async function findEntries(
    transactionHashes: string[]
): Promise<DecryptedAmount[]> {
    return (await knex())
        .select<DecryptedAmount[]>()
        .table(databaseNames.decryptedAmountsTable)
        .whereIn('transactionHash', transactionHashes);
}

const exposedMethods: DecryptedAmountsMethods = {
    insert,
    findEntries,
};

export default exposedMethods;
