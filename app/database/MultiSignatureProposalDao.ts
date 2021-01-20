import { MultiSignatureTransaction } from '../components/multisig/UpdateMicroGtuPerEuro';
import knex from './knex';

const multiSignatureProposalTable = 'multi_signature_proposal';

/**
 * Function for inserting a multi signature transaction proposal
 * into the database.
 */
export async function insert(transaction: MultiSignatureTransaction) {
    return (await knex())
        .table(multiSignatureProposalTable)
        .insert(transaction);
}

/**
 * Function for reading all items in the multi signature transaction proposal table.
 */
export async function getAll(): Promise<MultiSignatureTransaction[]> {
    return (await knex()).select().table(multiSignatureProposalTable);
}
