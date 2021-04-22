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
    Credential,
    ExportData,
    Dispatch,
} from '../../utils/types';
import routes from '../../constants/routes.json';
import {
    loadIdentities,
    importIdentities,
    identitiesSelector,
} from '../../features/IdentitySlice';
import {
    loadAccounts,
    importAccount,
    accountsSelector,
} from '../../features/AccountSlice';
import {
    loadAddressBook,
    importAddressBookEntry,
    addressBookSelector,
} from '../../features/AddressBookSlice';
import {
    importCredentials,
    credentialsSelector,
    loadCredentials,
} from '../../features/CredentialSlice';
import MessageModal from '../../components/MessageModal';
import { checkDuplicates } from '../../utils/importHelpers';
import { partition } from '../../utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';

type IdentityKey = keyof Identity;
type AccountKey = keyof Account;
type AddressBookEntryKey = keyof AddressBookEntry;
type CredentialKey = keyof Credential;

export const identityFields: IdentityKey[] = ['id', 'name', 'randomness']; // TODO are there any other fields we should check?
export const accountFields: AccountKey[] = ['name', 'address', 'identityId'];
export const addressBookFields: AddressBookEntryKey[] = [
    'name',
    'address',
    'note',
];
export const credentialFields: CredentialKey[] = [
    'accountAddress',
    'credentialNumber',
    'credId',
];

export async function importNewIdentities(
    newIdentities: Identity[],
    existingIdentities: Identity[]
): Promise<Identity[]> {
    const [nonDuplicates, duplicates] = partition(
        newIdentities,
        (newIdentity) =>
            checkDuplicates(newIdentity, existingIdentities, identityFields, [])
    );
    if (nonDuplicates.length > 0) {
        await importIdentities(nonDuplicates);
    }
    return duplicates;
}

export async function importAccounts(
    newAccounts: Account[],
    existingAccounts: Account[]
): Promise<Account[]> {
    const [nonDuplicates, duplicates] = partition(newAccounts, (newAccount) =>
        checkDuplicates(newAccount, existingAccounts, accountFields, [])
    );
    if (nonDuplicates.length > 0) {
        await importAccount(nonDuplicates);
    }
    return duplicates;
}

export async function importEntries(
    entries: AddressBookEntry[],
    addressBook: AddressBookEntry[]
): Promise<AddressBookEntry[]> {
    const [nonDuplicates, duplicates] = partition(entries, (entry) =>
        checkDuplicates(entry, addressBook, addressBookFields, ['note'])
    );
    if (nonDuplicates.length > 0) {
        await importAddressBookEntry(nonDuplicates);
    }
    return duplicates;
}

export async function importNewCredentials(
    newCredentials: Credential[],
    existingCredentials: Credential[]
): Promise<Credential[]> {
    const [nonDuplicates, duplicates] = partition(
        newCredentials,
        (newCredential) =>
            checkDuplicates(
                newCredential,
                existingCredentials,
                credentialFields,
                []
            )
    );
    if (nonDuplicates.length > 0) {
        await importCredentials(nonDuplicates);
    }
    return duplicates;
}

interface Location {
    state: ExportData;
}

interface Props {
    location: Location;
}

interface SetDuplicates {
    identities(duplicates: Identity[]): void;
    accounts(duplicates: Account[]): void;
    addressBook(duplicates: AddressBookEntry[]): void;
}

async function performImport(
    importedData: ExportData,
    existingData: ExportData,
    setDuplicates: SetDuplicates,
    dispatch: Dispatch
) {
    const duplicateIdentities = await importNewIdentities(
        importedData.identities,
        existingData.identities
    );
    loadIdentities(dispatch);
    setDuplicates.identities(duplicateIdentities);

    const duplicateAccounts = await importAccounts(
        importedData.accounts,
        existingData.accounts
    );
    loadAccounts(dispatch);
    setDuplicates.accounts(duplicateAccounts);

    const duplicateEntries = await importEntries(
        importedData.addressBook,
        existingData.addressBook
    );
    loadAddressBook(dispatch);
    setDuplicates.addressBook(duplicateEntries);

    await importNewCredentials(
        importedData.credentials,
        existingData.credentials
    );
    loadCredentials(dispatch);
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
            const setters = {
                identities: setDuplicateIdentities,
                accounts: setDuplicateAccounts,
                addressBook: setDuplicateEntries,
            };
            performImport(
                importedData,
                {
                    identities,
                    accounts,
                    addressBook,
                    credentials,
                },
                setters,
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
                title="Unable to complete import!"
                buttonText="return!"
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
