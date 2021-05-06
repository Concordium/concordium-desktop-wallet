import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import Button from '~/cross-app-components/Button';
import {
    AddressBookEntry,
    Account,
    Identity,
    ExportData,
    Dispatch,
} from '../../utils/types';
import routes from '../../constants/routes.json';
import {
    loadIdentities,
    identitiesSelector,
} from '../../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../../features/AccountSlice';
import {
    loadAddressBook,
    importAddressBookEntry,
    addressBookSelector,
} from '../../features/AddressBookSlice';
import {
    credentialsSelector,
    loadCredentials,
} from '../../features/CredentialSlice';
import MessageModal from '../../components/MessageModal';
import { hasNoDuplicate, importWallets } from '../../utils/importHelpers';
import { partition } from '../../utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets } from '~/database/WalletDao';

type AddressBookEntryKey = keyof AddressBookEntry;

export const addressBookFields: AddressBookEntryKey[] = [
    'name',
    'address',
    'note',
];

export async function importAddressBookEntries(
    entries: AddressBookEntry[],
    addressBook: AddressBookEntry[]
): Promise<AddressBookEntry[]> {
    const [nonDuplicates, duplicates] = partition(entries, (entry) =>
        hasNoDuplicate(entry, addressBook, addressBookFields, ['note'])
    );
    if (nonDuplicates.length > 0) {
        await importAddressBookEntry(nonDuplicates);
    }
    return duplicates;
}

interface Location {
    state: ExportData;
}

interface Props {
    location: Location;
}

async function performImport(
    importedData: ExportData,
    existingData: ExportData,
    dispatch: Dispatch
) {
    const existingWallets = await getAllWallets();
    const existingDataWithWallets = {
        ...existingData,
        wallets: existingWallets,
    };

    await importWallets(
        existingWallets,
        existingDataWithWallets,
        importedData.wallets,
        importedData.identities,
        importedData.accounts,
        importedData.credentials
    );

    await importAddressBookEntries(
        importedData.addressBook,
        existingData.addressBook
    );

    await loadIdentities(dispatch);
    await loadAccounts(dispatch);
    await loadAddressBook(dispatch);
    await loadCredentials(dispatch);
}

/**
 * Component to import identities/accounts/addressBookEntries.
 * Expects prop.location.state to contain identities/accounts/addressBookEntries.
 * Checks for duplicates and saves the input.
 * Displays the imported entries.
 */
export default function PerformImport({ location }: Props) {
    const dispatch = useDispatch();
    const importedData = location.state;
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const credentials = useSelector(credentialsSelector);

    const [duplicateIdentities, setDuplicateIdentities] = useState<Identity[]>(
        []
    );
    const [duplicateAccounts, setDuplicateAccounts] = useState<Account[]>([]);
    const [duplicateEntries, setDuplicateEntries] = useState<
        AddressBookEntry[]
    >([]);
    const [open, setOpen] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!started) {
            setStarted(true);
            performImport(
                importedData,
                {
                    identities,
                    accounts,
                    addressBook,
                    credentials,
                    wallets: [],
                },
                dispatch
            ).catch(() => setOpen(true));
        }
    }, [
        importedData,
        identities,
        accounts,
        credentials,
        addressBook,
        setDuplicateEntries,
        setDuplicateAccounts,
        setDuplicateIdentities,
        dispatch,
        started,
    ]);

    const accountList = (identity: Identity) =>
        importedData.accounts
            .filter((account: Account) => account.identityId === identity.id)
            .map((account: Account) => (
                <p key={account.address}>
                    {account.name}
                    {duplicateAccounts.includes(account)
                        ? ' (Already existed)'
                        : ''}
                </p>
            ));

    const AddressBookList = importedData.addressBook.map(
        (entry: AddressBookEntry) => (
            <p key={entry.address} className={styles.importedAddress}>
                {entry.name}
                {duplicateEntries.includes(entry) ? ' (Already existed)' : ''}
            </p>
        )
    );

    return (
        <>
            <MessageModal
                title="Unable to complete import"
                buttonText="Okay"
                onClose={() => dispatch(push(routes.EXPORTIMPORT))}
                open={open}
            />
            <PageLayout>
                <PageLayout.Header>
                    <h1>Export and Import</h1>
                </PageLayout.Header>
                <PageLayout.Container disableBack>
                    <Columns divider columnScroll>
                        <Columns.Column>
                            <div className={styles.successfulImport}>
                                <h2 className={styles.title}>
                                    Import successful
                                </h2>
                                <CheckmarkIcon className={styles.checkmark} />
                                <p>
                                    That’s it! Your import completed
                                    successfully.
                                </p>
                                <Button
                                    onClick={() =>
                                        dispatch(push(routes.EXPORTIMPORT))
                                    }
                                >
                                    Okay, thanks!
                                </Button>
                            </div>
                        </Columns.Column>
                        <Columns.Column className={styles.importedList}>
                            {importedData.identities.map(
                                (identity: Identity) => (
                                    <>
                                        <h2
                                            className={styles.importedIdentity}
                                            key={identity.id}
                                        >
                                            <b>ID:</b> {identity.name}
                                            {duplicateIdentities.includes(
                                                identity
                                            )
                                                ? ' (Already existed)'
                                                : ''}
                                        </h2>
                                        <div
                                            className={styles.importedAccounts}
                                        >
                                            <p className={styles.bold}>
                                                Accounts:
                                            </p>
                                            {accountList(identity)}
                                        </div>
                                    </>
                                )
                            )}
                            <h2 className={styles.AddressBookHeader}>
                                Address Book
                            </h2>
                            <p
                                className={clsx(
                                    styles.bold,
                                    styles.importedAddress
                                )}
                            >
                                Recipient accounts:
                            </p>
                            {AddressBookList}
                        </Columns.Column>
                    </Columns>
                </PageLayout.Container>
            </PageLayout>
        </>
    );
}
