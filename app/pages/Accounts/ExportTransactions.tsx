import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Account, TransferTransaction } from '../../utils/types';
import { getTransactionsOfAccount } from '../../database/TransactionDao';
import { saveFile } from '../../utils/FileHelper';
import { toCSV } from '../../utils/basicHelpers';
import { getISOFormat } from '../../utils/timeHelpers';
import { attachNames } from '../../utils/transactionHelpers';
import exportTransactionFields from '../../constants/exportTransactionFields.json';

interface Props {
    account: Account;
    returnFunction(): void;
}

const getName = (i: string[]) => i[0];
const getLabel = (i: string[]) => i[1];
const exportedFields = Object.entries(exportTransactionFields);

// Parse a transaction into a array of values, corresponding to those of the exported fields.
function parseTransaction(transaction: TransferTransaction) {
    const fieldValues: Record<string, string> = {};
    Object.entries(transaction).forEach(([key, value]) => {
        fieldValues[key] = value?.toString();
    });

    fieldValues.dateTime = getISOFormat(transaction.blockTime);

    return exportedFields.map((field) => fieldValues[getName(field)]);
}

// Updates transactions of the account, converts them to csv and saves the file.
async function exportTransactions(account: Account) {
    let transactions = await getTransactionsOfAccount(account); // load from database
    transactions = await attachNames(transactions);

    const csv = toCSV(
        transactions.map(parseTransaction),
        exportedFields.map(getLabel)
    );
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
