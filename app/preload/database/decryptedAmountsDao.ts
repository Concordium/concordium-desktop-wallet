import { DecryptedAmount } from '~/utils/types';
import { knex } from '~/database/knex';
import { decryptedAmountsTable } from '~/constants/databaseNames.json';
import { DecryptedAmountsMethods } from '../preloadTypes';

async function insert(entry: DecryptedAmount) {
    return (await knex())(decryptedAmountsTable).insert(entry);
}

async function findEntries(
    transactionHashes: string[]
): Promise<DecryptedAmount[]> {
    return (await knex())
        .select<DecryptedAmount[]>()
        .table(decryptedAmountsTable)
        .whereIn('transactionHash', transactionHashes);
}

const exposedMethods: DecryptedAmountsMethods = {
    insert,
    findEntries,
};

export default exposedMethods;
