import { MultiSignatureTransaction } from '../utils/types';
import { multiSignatureProposalTable } from '../constants/databaseNames.json';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Function for inserting a multi signature transaction proposal
 * into the database.
 */
export async function insert(transaction: Partial<MultiSignatureTransaction>) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.multiSignatureTransaction.insert,
        transaction
    );
}

/**
 * Updates the given proposal entry.
 */
export async function updateEntry(
    multiSigTransaction: MultiSignatureTransaction
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.multiSignatureTransaction.update,
        multiSigTransaction
    );
}

/**
 * Function for reading all items in the multi signature transaction proposal table.
 */
export async function getAll(): Promise<MultiSignatureTransaction[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.dbSelectAll,
        multiSignatureProposalTable
    );
}
