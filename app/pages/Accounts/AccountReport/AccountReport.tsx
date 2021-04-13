import React, { useState } from 'react';
import AdmZip from 'adm-zip';
import { Account, TransferTransaction } from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import AccountPageHeader from '../AccountPageHeader';
import routes from '~/constants/routes.json';

import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import Timestamp from '~/components/Form/InputTimestamp';
import PickAccount from '~/pages/UpdateAccountCredentials/PickAccount';

import { getTransactionsOfAccount } from '~/database/TransactionDao';
import { toCSV } from '~/utils/basicHelpers';
import { attachNames } from '~/utils/transactionHelpers';
import exportTransactionFields from '~/constants/exportTransactionFields.json';
import { getISOFormat } from '~/utils/timeHelpers';
import { saveFile } from '~/utils/FileHelper';

import multiSigLayout from '~/pages/multisig/MultiSignatureLayout/MultiSignatureLayout.module.scss';
import styles from './AccountReport.module.scss';

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
export async function getAccountCSV(account: Account) {
    let transactions = await getTransactionsOfAccount(account); // load from database
    transactions = await attachNames(transactions);

    return toCSV(
        transactions.map(parseTransaction),
        exportedFields.map(getLabel)
    );
}

export default function AccountReport() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [adding, setAdding] = useState(false);
    const [from, setFrom] = useState<Date | undefined>();
    const [to, setTo] = useState<Date | undefined>();

    async function makeReport() {
        const accountsLength = accounts.length;
        if (accountsLength === 1) {
            return saveFile(
                await getAccountCSV(accounts[0]),
                'Save Account Report',
                'csv'
            );
        }
        const zip = new AdmZip();
        for (let i = 0; i < accounts.length; i += 1) {
            const account = accounts[i];
            zip.addFile(
                `${account.name}.csv`,
                // eslint-disable-next-line  no-await-in-loop
                Buffer.from(await getAccountCSV(account))
            );
        }
        return saveFile(zip.toBuffer(), 'Save Account Reports', 'zip');
    }

    function addAccount(account: Account) {
        setAccounts((currentAccounts) => [...currentAccounts, account]);
        setAdding(false);
    }

    function removeAccount(account: Account) {
        setAccounts((currentAccounts) =>
            currentAccounts.filter((acc) => acc.address !== account.address)
        );
    }

    const rightColumn = (
        <div className={styles.rightColumn}>
            <Button onClick={() => setAdding(true)}>Add another account</Button>
            <div className={styles.accountList}>
                {accounts.map((account) => (
                    <div
                        key={account.address}
                        className={styles.accountListElement}
                    >
                        <div>
                            <p>{account.name}</p>
                            <br />
                            <p className={styles.address}>{account.address}</p>
                        </div>
                        <Button
                            disabled={accounts.length === 0}
                            onClick={() => removeAccount(account)}
                        >
                            remove
                        </Button>
                    </div>
                ))}
            </div>
            <Button size="big" onClick={makeReport}>
                Make Account Report
            </Button>
        </div>
    );

    return (
        <PageLayout>
            <PageLayout.Header>
                <AccountPageHeader />
            </PageLayout.Header>
            <PageLayout.Container
                className={multiSigLayout.container}
                padding="vertical"
                closeRoute={routes.ACCOUNTS}
                disableBack={false}
            >
                <h2 className={multiSigLayout.header}>Make Account Report</h2>
                <div className={multiSigLayout.content}>
                    <Columns
                        divider
                        columnScroll
                        columnClassName={styles.column}
                    >
                        <Columns.Column header="Time Period & Filters">
                            <h2>Time Period to include</h2>
                            <div className={styles.timestamp}>
                                <Timestamp
                                    value={from}
                                    onChange={setFrom}
                                    name="from"
                                    label="From:"
                                />
                            </div>
                            <div className={styles.timestamp}>
                                <Timestamp
                                    value={to}
                                    onChange={setTo}
                                    name="to"
                                    label="To:"
                                />
                            </div>
                        </Columns.Column>
                        <Columns.Column header="Accounts to include">
                            {adding ? (
                                <PickAccount
                                    onClick={addAccount}
                                    filter={(account: Account) =>
                                        !accounts.includes(account)
                                    }
                                />
                            ) : (
                                rightColumn
                            )}
                        </Columns.Column>
                    </Columns>
                </div>
            </PageLayout.Container>
        </PageLayout>
    );
}
