import { MultiSignatureTransaction } from '../utils/types';
import { multiSignatureProposalTable } from '../constants/databaseNames.json';

/**
 * Function for reading all items in the multi signature transaction proposal table.
 */
export async function getAllProposals(): Promise<MultiSignatureTransaction[]> {
    return window.database.general.selectAll(multiSignatureProposalTable);
}

export default () => window.database.multiSignatureTransaction;
