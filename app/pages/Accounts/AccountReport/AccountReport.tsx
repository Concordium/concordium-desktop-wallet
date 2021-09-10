import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { LocationDescriptorObject } from 'history';
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
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import DecryptModal, { DecryptModalInput } from '../DecryptModal';
import transactionKindNames from '~/constants/transactionKindNames.json';

import {
    FilterOption,
    filterKind,
    filterKindGroup,
    getAccountCSV,
    containsEncrypted,
} from './util';
import styles from './AccountReport.module.scss';
import type { SaveFileData } from '~/preload/preloadTypes';
import saveFile from '~/utils/FileHelper';
import DisplayAddress from '~/components/DisplayAddress';

const decryptMessage = (name: string) =>
    `'${name}' has encrypted funds. To create a complete account report, we need to decrypt them. Otherwise this account will be skipped.`;

const transactionTypeFilters: FilterOption[] = [
    filterKindGroup(transactionKindNames[TransactionKindString.Transfer], [
        TransactionKindString.Transfer,
        TransactionKindString.TransferWithMemo,
    ]),
    filterKindGroup(
        transactionKindNames[TransactionKindString.TransferWithSchedule],
        [
            TransactionKindString.TransferWithSchedule,
            TransactionKindString.TransferWithScheduleAndMemo,
        ]
    ),
    filterKindGroup(
        transactionKindNames[TransactionKindString.EncryptedAmountTransfer],
        [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
        ]
    ),
    filterKind(TransactionKindString.TransferToPublic),
    filterKind(TransactionKindString.TransferToEncrypted),
    filterKind(TransactionKindString.FinalizationReward),
    filterKind(TransactionKindString.BakingReward),
    filterKind(TransactionKindString.BlockReward),
    filterKind(TransactionKindString.UpdateCredentials),
    filterKindGroup('Baker Transactions', [
        TransactionKindString.AddBaker,
        TransactionKindString.RemoveBaker,
        TransactionKindString.UpdateBakerKeys,
        TransactionKindString.UpdateBakerRestakeEarnings,
        TransactionKindString.UpdateBakerStake,
    ]),
];

interface State {
    account: Account;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Components to make account reports.
 * Allows the user to enable filters and to choose accounts.
 */
export default function AccountReport({ location }: Props) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [showDecrypt, setShowDecrypt] = useState<DecryptModalInput>({
        show: false,
    });

    const [accounts, setAccounts] = useState<Account[]>(
        location?.state ? [location?.state.account] : []
    );
    const [adding, setAdding] = useState(false);
    const [fromDate, setFrom] = useState<Date | undefined>(
        new Date(getNow() - TimeConstants.Month)
    );
    const [toDate, setTo] = useState<Date | undefined>(new Date(getNow()));
    const [currentFilters, setFilters] = useState<FilterOption[]>(() => [
        ...transactionTypeFilters,
    ]);

    function promptDecrypt(account: Account) {
        return new Promise((resolve) => {
            setShowDecrypt({
                show: true,
                header: decryptMessage(account.name),
                account,
                onFinish: (decrypted) => {
                    setShowDecrypt({ show: false });
                    resolve(decrypted);
                },
            });
        });
    }

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
        const accountsToReport: Account[] = [];
        for (const account of accounts) {
            const hasEncrypted = await containsEncrypted(
                account,
                currentFilters,
                fromDate,
                toDate
            );
            if (!hasEncrypted || (await promptDecrypt(account))) {
                accountsToReport.push(account);
            }
        }
        const accountsLength = accountsToReport.length;

        if (accountsLength === 0) {
            if (accounts.length > 1) {
                setShowError({
                    show: true,
                    header: 'Account Report was not saved.',
                    content: 'All chosen accounts have encrypted funds.',
                });
            }
            return Promise.resolve();
        }

        try {
            if (accountsLength === 1) {
                return saveFile(
                    await getAccountCSV(
                        accountsToReport[0],
                        currentFilters,
                        fromDate,
                        toDate
                    ),
                    {
                        title: 'Save Account Report',
                        defaultPath: `${accountsToReport[0].name}.csv`,
                        filters: [{ name: 'csv', extensions: ['csv'] }],
                    }
                );
            }

            const filesToZip: SaveFileData[] = [];
            for (let i = 0; i < accountsLength; i += 1) {
                const account = accountsToReport[i];
                const data = await getAccountCSV(
                    account,
                    currentFilters,
                    fromDate,
                    toDate
                );
                filesToZip.push({
                    filename: `${account.name}.csv`,
                    data: Buffer.from(data),
                });
            }

            // Send to main thread for saving the files as a single zip file.
            return window.files.saveZipFileDialog(filesToZip);
        } catch (e) {
            setShowError({
                show: true,
                header: 'Account Report was not saved.',
                content: `Encountered error: ${e.message}`,
            });
            return Promise.resolve();
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
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <DecryptModal {...showDecrypt} />
            <PageLayout>
                <PageLayout.Header>
                    <AccountPageHeader />
                </PageLayout.Header>
                <PageLayout.Container
                    className="flexColumn"
                    closeRoute={routes.ACCOUNTS}
                >
                    <h2 className={styles.header}>Make Account Report</h2>
                    <div
                        className={clsx(
                            'pT10 flexColumn flexChildFill',
                            styles.container
                        )}
                    >
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
                                            messageWhenEmpty="All accounts have already been added"
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
                                                        <DisplayAddress
                                                            outerClassName={
                                                                styles.address
                                                            }
                                                            lineLength={25}
                                                            address={
                                                                account.address
                                                            }
                                                        />
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
