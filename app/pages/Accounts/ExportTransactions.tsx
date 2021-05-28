import React, { useState } from 'react';
import { Account, TransferTransaction } from '../../utils/types';
import { getTransactionsOfAccount } from '../../database/TransactionDao';
import { saveFile } from '../../utils/FileHelper';
import { toCSV } from '../../utils/basicHelpers';
import { getISOFormat } from '../../utils/timeHelpers';
import { attachNames } from '../../utils/transactionHelpers';
import exportTransactionFields from '../../constants/exportTransactionFields.json';
import ErrorModal from '../../components/SimpleErrorModal';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import styles from './Accounts.module.scss';

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
async function exportTransactions(account: Account, openModal: () => void) {
    // TODO: Create a getter without a limit, as this will not allow for exports of all transactions.
    let { transactions } = await getTransactionsOfAccount(account, [], 1000000);
    transactions = await attachNames(transactions);

    const csv = toCSV(
        transactions.map(parseTransaction),
        exportedFields.map(getLabel)
    );
    try {
        await saveFile(csv, { title: 'Export Transactions' });
    } catch (e) {
        openModal();
    }
}

export default function ExportTransactions({ account, returnFunction }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <Card className="relative flexColumn justifyCenter pH50">
            <ErrorModal
                show={modalOpen}
                header="Export failed"
                onClick={() => setModalOpen(false)}
            />
            <CloseButton
                className={styles.closeButton}
                onClick={returnFunction}
            />
            <h3 className="textCenter mT0">Export Transactions</h3>
            <Button
                className="mT20"
                onClick={() =>
                    exportTransactions(account, () => setModalOpen(true))
                }
            >
                Export
            </Button>
        </Card>
    );
}
