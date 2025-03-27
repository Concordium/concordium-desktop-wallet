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

export const insert: typeof window.database.multiSignatureTransaction.insert = (...args) => window.database.multiSignatureTransaction.insert(...args);
export const updateEntry: typeof window.database.multiSignatureTransaction.update = (...args) => window.database.multiSignatureTransaction.update(...args);
export const getMaxOpenNonceOnAccount: typeof window.database.multiSignatureTransaction.getMaxOpenNonceOnAccount = (...args) => window.database.multiSignatureTransaction.getMaxOpenNonceOnAccount(...args);
