import { IpcMain } from 'electron';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import { multiSignatureProposalTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import ipcCommands from '~/constants/ipcCommands.json';
import { parse } from '~/utils/JSONHelper';
import { max } from '~/utils/basicHelpers';

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

async function getMaxOpenNonceOnAccount(address: string): Promise<bigint> {
    const openProposals: MultiSignatureTransaction[] = await (await knex())
        .select()
        .table(multiSignatureProposalTable)
        .where({ status: MultiSignatureTransactionStatus.Open });
    const transactionsOnAccount: AccountTransaction[] = openProposals
        .map((prop) => parse(prop.transaction))
        .filter((transaction) => transaction.sender === address);
    return transactionsOnAccount.reduce(
        (acc, x) => max(acc, BigInt(x.nonce)),
        0n
    );
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

    ipcMain.handle(
        ipcCommands.database.multiSignatureTransaction.getMaxOpenNonceOnAccount,
        async (_event, address: string) => {
            return getMaxOpenNonceOnAccount(address);
        }
    );
}
