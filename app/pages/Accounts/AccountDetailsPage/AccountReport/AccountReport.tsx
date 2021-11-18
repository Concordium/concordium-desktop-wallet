import React, { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { LocationDescriptorObject } from 'history';
import PlusIcon from '@resources/svg/plus.svg';
import { useSelector } from 'react-redux';
import {
    Account,
    CredentialNumberPrfKey,
    TransactionFilter,
} from '~/utils/types';
import PageLayout from '~/components/PageLayout';
import AccountPageHeader from '../../AccountPageHeader';
import routes from '~/constants/routes.json';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import CloseButton from '~/cross-app-components/CloseButton';
import PickAccount from '~/components/PickAccount';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import { chooseFileDestination } from '~/utils/FileHelper';
import DisplayAddress from '~/components/DisplayAddress';
import TransactionFilters, {
    TransactionFiltersRef,
} from '~/components/TransactionFilters';
import DecryptModal, { DecryptModalInput } from './DecryptModal';
import MessageModal from '~/components/MessageModal';
import Columns from '~/components/Columns';

import styles from './AccountReport.module.scss';
import { hasEncryptedBalance } from '~/utils/accountHelpers';
import { globalSelector } from '~/features/GlobalSlice';

const decryptMessage = (name: string) =>
    `'${name}' has encrypted funds. To create a complete account report, we need to decrypt them. Otherwise this account will be skipped.`;

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
    const global = useSelector(globalSelector);
    if (!global) {
        throw new Error(
            'Global must be available before we can make the account report'
        );
    }

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
    const [makingReport, setMakingReport] = useState(false);

    const filtersRef = useRef<TransactionFiltersRef>(null);

    function promptDecrypt(account: Account) {
        return new Promise<{
            decrypted: boolean;
            address: string;
            credentialNumber: number;
            prfKeySeed: string;
        }>((resolve) => {
            setShowDecrypt({
                show: true,
                header: decryptMessage(account.name),
                account,
                onFinish: (
                    decrypted: boolean,
                    address: string,
                    credentialNumber: number,
                    prfKeySeed: string
                ) => {
                    resolve({
                        decrypted,
                        address,
                        credentialNumber,
                        prfKeySeed,
                    });
                },
            });
        });
    }

    /**
     * Constructs one or more account reports. If there are multiple chosen accounts,
     * then the reports will be bundled into a zip file.
     */
    const makeReport = useCallback(
        async (filters: TransactionFilter) => {
            let prfKeyMap: Record<string, CredentialNumberPrfKey> = {};
            const accountsToReport: Account[] = [];
            for (const account of accounts) {
                const hasEncrypted = hasEncryptedBalance(account);
                const includeEncryptedTransfers =
                    filters.encryptedAmountTransfer ||
                    filters.encryptedAmountTransferWithMemo;
                if (hasEncrypted && includeEncryptedTransfers) {
                    const {
                        decrypted,
                        address,
                        credentialNumber,
                        prfKeySeed,
                    } = await promptDecrypt(account);
                    if (decrypted) {
                        const updatedPrfKeyMap = {
                            ...prfKeyMap,
                        };
                        updatedPrfKeyMap[address] = {
                            credentialNumber,
                            prfKeySeed,
                        };
                        prfKeyMap = updatedPrfKeyMap;
                        accountsToReport.push(account);
                    }
                } else {
                    accountsToReport.push(account);
                }
            }
            setShowDecrypt({ show: false });
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

            const multipleAccounts = accountsLength > 1;

            const opts = multipleAccounts
                ? {
                      title: 'Save Account Reports',
                      defaultPath: 'reports.zip',
                      filters: [{ name: 'zip', extensions: ['zip'] }],
                  }
                : {
                      title: 'Save Account Report',
                      defaultPath: `${accountsToReport[0].name}.csv`,
                      filters: [{ name: 'csv', extensions: ['csv'] }],
                  };

            const fileName = await chooseFileDestination(opts);
            if (!fileName) {
                return false;
            }

            try {
                setMakingReport(true);
                if (multipleAccounts) {
                    await window.accountReport.multiple(
                        fileName,
                        accountsToReport,
                        filters,
                        global,
                        prfKeyMap
                    );
                } else {
                    await window.accountReport.single(
                        fileName,
                        accountsToReport[0],
                        filters,
                        global,
                        prfKeyMap
                    );
                }
                setMakingReport(false);
                return true;
            } catch (e) {
                setMakingReport(false);
                setShowError({
                    show: true,
                    header: 'Account Report was not saved.',
                    content: `Encountered error: ${e.message}`,
                });
                return Promise.resolve();
            }
        },
        [accounts, global]
    );

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
            <MessageModal
                open={makingReport}
                title={`Generating Report${accounts.length > 1 ? 's' : ''}`}
                buttonText="Abort"
                onClose={() => window.accountReport.abort()}
                disableClose
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
                                    <TransactionFilters ref={filtersRef} />
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
                                            disabled={
                                                accounts.length === 0 ||
                                                makingReport
                                            }
                                            onClick={() =>
                                                filtersRef.current?.submit(
                                                    makeReport
                                                )
                                            }
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
