import { IpcMain } from 'electron';
import { MultiSignatureTransaction } from '~/utils/types';
import { multiSignatureProposalTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import ipcCommands from '~/constants/ipcCommands.json';

async function insert(transaction: Partial<MultiSignatureTransaction>) {
    return (await knex())
        .table(multiSignatureProposalTable)
        .insert(transaction);
}

async function updateEntry(multiSigTransaction: MultiSignatureTransaction) {
    return (await knex())(multiSignatureProposalTable)
        .where({ id: multiSigTransaction.id })
        .update(multiSigTransaction);
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.multiSignatureTransaction.insert,
        async (_event, transaction: Partial<MultiSignatureTransaction>) => {
            return insert(transaction);
        }
    );

    ipcMain.handle(
        ipcCommands.database.multiSignatureTransaction.update,
        async (_event, multiSigTransaction: MultiSignatureTransaction) => {
            return updateEntry(multiSigTransaction);
        }
    );
}
