import { MultiSignatureTransaction } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

/**
 * Function for reading all items in the multi signature transaction proposal table.
 */
export async function getAll(): Promise<MultiSignatureTransaction[]> {
    return window.database.general.selectAll(
        databaseNames.multiSignatureProposalTable
    );
}

export const {
    insert,
    update: updateEntry,
    getMaxOpenNonceOnAccount,
} = window.database.multiSignatureTransaction;
