import {
    AccountTransaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import databaseNames from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { parse } from '~/utils/JSONHelper';
import { max } from '~/utils/basicHelpers';
import { MultiSignatureTransactionMethods } from '~/preload/preloadTypes';

/**
 * Function for inserting a multi signature transaction proposal
 * into the database.
 */
async function insert(transaction: Partial<MultiSignatureTransaction>) {
    return (await knex())
        .table(databaseNames.multiSignatureProposalTable)
        .insert(transaction);
}

/**
 * Updates the given proposal entry.
 */
async function updateEntry(multiSigTransaction: MultiSignatureTransaction) {
    return (await knex())(databaseNames.multiSignatureProposalTable)
        .where({ id: multiSigTransaction.id })
        .update(multiSigTransaction);
}

async function getMaxOpenNonceOnAccount(address: string): Promise<bigint> {
    const openProposals: MultiSignatureTransaction[] = await (await knex())
        .select()
        .table(databaseNames.multiSignatureProposalTable)
        .where({ status: MultiSignatureTransactionStatus.Open });
    const transactionsOnAccount: AccountTransaction[] = openProposals
        .map((prop) => parse(prop.transaction))
        .filter((transaction) => transaction.sender === address);
    return transactionsOnAccount.reduce(
        (acc, x) => max(acc, BigInt(x.nonce)),
        0n
    );
}

const exposedMethods: MultiSignatureTransactionMethods = {
    insert,
    update: updateEntry,
    getMaxOpenNonceOnAccount,
};
export default exposedMethods;
