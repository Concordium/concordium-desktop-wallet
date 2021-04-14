import React, { useState } from 'react';
import { LocationDescriptorObject } from 'history';
import AdmZip from 'adm-zip';
import {
    Account,
    TransferTransaction,
    TransactionKindString,
} from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import AccountPageHeader from '../AccountPageHeader';
import routes from '~/constants/routes.json';
import {
    getNow,
    TimeConstants,
    dateFromTimeStamp,
    getISOFormat,
} from '~/utils/timeHelpers';

import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import CloseButton from '~/cross-app-components/CloseButton';
import Timestamp from '~/components/Form/InputTimestamp';
import PickAccount from '~/pages/UpdateAccountCredentials/PickAccount';
import Checkbox from '~/components/Form/Checkbox';
import ErrorModal from '~/components/SimpleErrorModal';

import { getTransactionsOfAccount } from '~/database/TransactionDao';
import { toCSV } from '~/utils/basicHelpers';
import { attachNames } from '~/utils/transactionHelpers';
import exportTransactionFields from '~/constants/exportTransactionFields.json';

import { saveFile } from '~/utils/FileHelper';

import multiSigLayout from '~/pages/multisig/MultiSignatureLayout/MultiSignatureLayout.module.scss';
import styles from './AccountReport.module.scss';

type Filter = (transaction: TransferTransaction) => boolean;

interface FilterOption {
    filter: Filter;
    label: string;
    key: string;
}

function filterKind(label: string, kind: TransactionKindString): FilterOption {
    return {
        label,
        key: kind,
        filter: (transaction: TransferTransaction) =>
            transaction.transactionKind === kind,
    };
}

const transactionTypeFilters: FilterOption[] = [
    filterKind('Simple Transfers', TransactionKindString.Transfer),
    filterKind(
        'Scheduled Transfers',
        TransactionKindString.TransferWithSchedule
    ),
    filterKind('Transfers to Public', TransactionKindString.TransferToPublic),
    filterKind(
        'Transfers to Encrypted',
        TransactionKindString.TransferToEncrypted
    ),
    filterKind(
        'Encrypted Transfer',
        TransactionKindString.EncryptedAmountTransfer
    ),
    filterKind(
        'Finalization Rewards',
        TransactionKindString.FinalizationReward
    ),
    filterKind('Baker Rewards', TransactionKindString.BakingReward),
    filterKind('Block Rewards', TransactionKindString.BlockReward),
];

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

// Updates transactions of the account, and returns them as a csv string.
async function getAccountCSV(
    account: Account,
    filterOptions: FilterOption[],
    fromTime?: Date,
    toTime?: Date
) {
    let transactions = await getTransactionsOfAccount(account); // load from database
    transactions = transactions.filter(
        (transaction) =>
            (!fromTime ||
                dateFromTimeStamp(transaction.blockTime) > fromTime) &&
            (!toTime || dateFromTimeStamp(transaction.blockTime) < toTime)
    );
    transactions = transactions.filter((transaction) =>
        filterOptions.some((filterOption) => filterOption.filter(transaction))
    );
    transactions = await attachNames(transactions);

    return toCSV(
        transactions.map(parseTransaction),
        exportedFields.map(getLabel)
    );
}

interface Props {
    location: LocationDescriptorObject<Account>;
}

/**
 * Components to make account reports.
 * Allows the user to enable filters and to choose accounts.
 */
export default function AccountReport({ location }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>(
        location?.state ? [location?.state] : []
    );
    const [adding, setAdding] = useState(false);
    const [fromDate, setFrom] = useState<Date | undefined>(
        new Date(getNow() - TimeConstants.Day)
    );
    const [toDate, setTo] = useState<Date | undefined>(new Date(getNow()));
    const [currentFilters, setFilters] = useState<FilterOption[]>([]);

    // Flip the given filterOptions status (enabled/disabled)
    function flip(filterOption: FilterOption) {
        setFilters((filters) => {
            if (
                filters.some(
                    (currentFilter) => filterOption.key === currentFilter.key
                )
            ) {
                return filters.filter(
                    (currentFilter) => currentFilter.key !== filterOption.key
                );
            }
            return [filterOption, ...filters];
        });
    }

    /** Constructs the account report(s).
     * If there are multiple chosen accounts, the reports will be bundled into a zip file
     */
    async function makeReport() {
        try {
            const accountsLength = accounts.length;
            if (accountsLength === 1) {
                return saveFile(
                    await getAccountCSV(
                        accounts[0],
                        currentFilters,
                        fromDate,
                        toDate
                    ),
                    'Save Account Report',
                    'csv'
                );
            }
            const zip = new AdmZip();
            for (let i = 0; i < accounts.length; i += 1) {
                const account = accounts[i];
                zip.addFile(
                    `${account.name}.csv`,
                    Buffer.from(
                        // eslint-disable-next-line  no-await-in-loop
                        await getAccountCSV(
                            account,
                            currentFilters,
                            fromDate,
                            toDate
                        )
                    )
                );
            }
            return saveFile(zip.toBuffer(), 'Save Account Reports', 'zip');
        } catch (e) {
            setModalOpen(true);
            return Promise.resolve(false);
        }
    }

    // add account to the list of chosen accounts, and exit adding mode.
    function addAccount(account: Account) {
        setAccounts((currentAccounts) => [...currentAccounts, account]);
        setAdding(false);
    }

    // remove account from the list of chosen accounts.
    function removeAccount(account: Account) {
        setAccounts((currentAccounts) =>
            currentAccounts.filter((acc) => acc.address !== account.address)
        );
    }

    function RightColumn() {
        if (adding) {
            return (
                <>
                    <CloseButton
                        className={styles.addingCloseButton}
                        onClick={() => setAdding(false)}
                    />
                    <PickAccount
                        onClick={addAccount}
                        filter={(account: Account) =>
                            !accounts.includes(account)
                        }
                    />
                </>
            );
        }
        return (
            <div className={styles.rightColumn}>
                <Button onClick={() => setAdding(true)}>
                    Add another account
                </Button>
                <div className={styles.accountList}>
                    {accounts.map((account) => (
                        <div
                            key={account.address}
                            className={styles.accountListElement}
                        >
                            <div>
                                <p>{account.name}</p>
                                <br />
                                <p className={styles.address}>
                                    {account.address}
                                </p>
                            </div>
                            <Button onClick={() => removeAccount(account)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    size="big"
                    disabled={accounts.length === 0}
                    onClick={makeReport}
                >
                    Make Account Report
                </Button>
            </div>
        );
    }

    return (
        <>
            <ErrorModal
                show={modalOpen}
                header="Account Report was not saved."
                onClick={() => setModalOpen(false)}
            />
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
                    <h2 className={multiSigLayout.header}>
                        Make Account Report
                    </h2>
                    <div className={multiSigLayout.content}>
                        <Columns
                            divider
                            columnScroll
                            columnClassName={styles.column}
                        >
                            <Columns.Column header="Time Period & Filters">
                                <h5>Time Period to include</h5>
                                <div className={styles.timestamp}>
                                    <Timestamp
                                        value={fromDate}
                                        onChange={setFrom}
                                        name="from"
                                        label="From:"
                                    />
                                </div>
                                <div className={styles.timestamp}>
                                    <Timestamp
                                        value={toDate}
                                        onChange={setTo}
                                        name="to"
                                        label="To:"
                                    />
                                </div>
                                <h5>Transaction Types to be included</h5>
                                <div className={styles.filters}>
                                    {transactionTypeFilters.map(
                                        (filterOption) => (
                                            <Checkbox
                                                className={
                                                    styles.filterCheckbox
                                                }
                                                key={filterOption.key}
                                                checked={currentFilters.some(
                                                    (currentFilter) =>
                                                        filterOption.key ===
                                                        currentFilter.key
                                                )}
                                                onChange={() =>
                                                    flip(filterOption)
                                                }
                                            >
                                                {filterOption.label}
                                            </Checkbox>
                                        )
                                    )}
                                </div>
                            </Columns.Column>
                            <Columns.Column header="Accounts to include">
                                <RightColumn />
                            </Columns.Column>
                        </Columns>
                    </div>
                </PageLayout.Container>
            </PageLayout>
        </>
    );
}
