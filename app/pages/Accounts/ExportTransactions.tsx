import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Account, TransferTransaction } from '../../utils/types';
import { updateTransactions } from '../../features/TransactionSlice';
import { getTransactionsOfAccount } from '../../database/TransactionDao';
import { saveFile } from '../../utils/FileHelper';
import { toCSV } from '../../utils/basicHelpers';
import { attachNames } from '../../utils/transactionHelpers';

interface Props {
    account: Account;
    returnFunction(): void;
}

const exportedFields = [
    'blockTime',
    'transactionHash',
    'transactionKind',
    'fromAddressName',
    'toAddressName',
    'fromAddress',
    'toAddress',
    'cost',
    'subtotal',
    'total',
];

function parseTransaction(transaction: TransferTransaction) {
    return exportedFields.map(
        (field) =>
            transaction[field as keyof TransferTransaction]?.toString() ||
            'unknown'
    );
}

async function exportTransactions(account: Account) {
    await updateTransactions(account); // update from remote
    let transactions = await getTransactionsOfAccount(account); // load from database
    transactions = await attachNames(transactions);

    const csv = toCSV(transactions, parseTransaction, exportedFields);
    try {
        await saveFile(csv, 'Export Transactions');
    } catch (e) {
        // Export was cancelled.
        // TODO: inform user in the case where export was not canceled, but did indeed fail.
    }
}

export default function ExportTransactions({ account, returnFunction }: Props) {
    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">Export Transactions</Header>
            <Button onClick={() => exportTransactions(account)}>Export</Button>
        </>
    );
}
