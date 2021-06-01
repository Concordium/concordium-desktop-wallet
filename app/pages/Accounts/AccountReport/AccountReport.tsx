import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { LocationDescriptorObject } from 'history';
import AdmZip from 'adm-zip';
import PlusIcon from '@resources/svg/plus.svg';
import { Account, TransactionKindString } from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import AccountPageHeader from '../AccountPageHeader';
import routes from '~/constants/routes.json';
import { getNow, TimeConstants } from '~/utils/timeHelpers';

import Columns from '~/components/Columns';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import CloseButton from '~/cross-app-components/CloseButton';
import Timestamp from '~/components/Form/InputTimestamp';
import PickAccount from '~/components/PickAccount';
import Checkbox from '~/components/Form/Checkbox';
import ErrorModal from '~/components/SimpleErrorModal';

import { saveFile } from '~/utils/FileHelper';
import { FilterOption, filterKind, getAccountCSV } from './util';

import styles from './AccountReport.module.scss';

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
        new Date(getNow() - TimeConstants.Month)
    );
    const [toDate, setTo] = useState<Date | undefined>(new Date(getNow()));
    const [currentFilters, setFilters] = useState<FilterOption[]>(() => [
        ...transactionTypeFilters,
    ]);

    // Flip the given filterOptions status (enabled/disabled)
    function flipStatus(filterOption: FilterOption) {
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
    const makeReport = useCallback(async () => {
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
                    {
                        title: 'Save Account Report',
                        defaultPath: `${accounts[0].name}.csv`,
                        filters: [{ name: 'csv', extensions: ['csv'] }],
                    }
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
            return saveFile(zip.toBuffer(), {
                title: 'Save Account Reports',
                defaultPath: 'reports.zip',
                filters: [{ name: 'zip', extensions: ['zip'] }],
            });
        } catch (e) {
            setModalOpen(true);
            return Promise.resolve(false);
        }
    }, [accounts, currentFilters, fromDate, toDate]);

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
                    className="flexColumn"
                    closeRoute={routes.ACCOUNTS}
                >
                    <h2 className="pT30">Make Account Report</h2>
                    <div className="pT10 flexColumn flexChildFill">
                        <Columns
                            divider
                            columnScroll
                            className={styles.heightFull}
                            columnClassName={styles.heightFull}
                        >
                            <Columns.Column header="Time Period & Filters">
                                <div className={styles.wrapper}>
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
                                                    className="m10"
                                                    key={filterOption.key}
                                                    checked={currentFilters.some(
                                                        (currentFilter) =>
                                                            filterOption.key ===
                                                            currentFilter.key
                                                    )}
                                                    onChange={() =>
                                                        flipStatus(filterOption)
                                                    }
                                                >
                                                    {filterOption.label}
                                                </Checkbox>
                                            )
                                        )}
                                    </div>
                                </div>
                            </Columns.Column>
                            <Columns.Column header="Accounts to include">
                                {adding && (
                                    <div
                                        className={clsx(
                                            styles.wrapper,
                                            'relative'
                                        )}
                                    >
                                        <CloseButton
                                            className={styles.addingCloseButton}
                                            onClick={() => setAdding(false)}
                                        />
                                        <PickAccount
                                            setAccount={addAccount}
                                            filter={(account: Account) =>
                                                !accounts.includes(account)
                                            }
                                        />
                                    </div>
                                )}
                                {!adding && (
                                    <div
                                        className={clsx(
                                            styles.wrapper,
                                            'flexColumn',
                                            styles.heightFull
                                        )}
                                    >
                                        <Card
                                            className={
                                                styles.AddAnotherAccountButton
                                            }
                                        >
                                            <Button
                                                clear
                                                onClick={() => setAdding(true)}
                                            >
                                                <span>Add another account</span>
                                                <PlusIcon />
                                            </Button>
                                        </Card>
                                        <div className={styles.accountList}>
                                            {accounts.map((account) => (
                                                <div
                                                    key={account.address}
                                                    className={
                                                        styles.accountListElement
                                                    }
                                                >
                                                    <div>
                                                        <p>{account.name}</p>
                                                        <p
                                                            className={
                                                                styles.address
                                                            }
                                                        >
                                                            {account.address}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="tiny"
                                                        onClick={() =>
                                                            removeAccount(
                                                                account
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            className={styles.makeReportButton}
                                            disabled={accounts.length === 0}
                                            onClick={makeReport}
                                        >
                                            Make Account Report
                                        </Button>
                                    </div>
                                )}
                            </Columns.Column>
                        </Columns>
                    </div>
                </PageLayout.Container>
            </PageLayout>
        </>
    );
}
