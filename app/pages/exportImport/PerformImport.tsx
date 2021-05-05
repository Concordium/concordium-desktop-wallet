/* eslint-disable no-await-in-loop */
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
    WalletEntry,
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
import {
    hasNoDuplicate,
    isDuplicate,
    updateIdentityIdReference,
    updateWalletIdReference,
} from '../../utils/importHelpers';
import { partition } from '../../utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets, insertWallet } from '~/database/WalletDao';
import { insertIdentity } from '~/database/IdentityDao';
import { insertAccount } from '~/database/AccountDao';
import { insertCredential } from '~/database/CredentialDao';

type IdentityKey = keyof Identity;
type AccountKey = keyof Account;
type AddressBookEntryKey = keyof AddressBookEntry;
type CredentialKey = keyof Credential;

// TODO are there any other fields we should check?
export const identityFields: IdentityKey[] = ['id', 'name', 'randomness'];
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

/**
 * Imports a list of completely new wallets, i.e. wallets that cannot be matched with
 * a wallet entry currently in the database. The logical ids of the wallets and identities
 * may change when inserted into the database, which means that the references between objects
 * are also updated as part of the import.
 * @param newWallets the wallets that are new to this database
 * @param importedIdentities the total list of identities currently being imported
 */
// TODO This method should be transaction towards the database. Is that possible with SQLite and our dependencies?
async function importNewWallets(
    newWallets: WalletEntry[],
    importedIdentities: Identity[],
    importedCredentials: Credential[],
    importedAccounts: Account[]
) {
    const newWalletIds = newWallets.map((newWallet) => newWallet.id);

    // Extract exactly those identities, credentials and accounts that are attached to
    // the new wallets being inserted.
    const attachedIdentities = importedIdentities.filter((identity) =>
        newWalletIds.includes(identity.walletId)
    );
    const attachedIdentityIds = attachedIdentities.map(
        (attachedIdent) => attachedIdent.id
    );

    // The attached credentials are found via the attached identities.
    const attachedCredentials = importedCredentials.filter((credential) => {
        if (
            credential.identityId !== undefined &&
            attachedIdentityIds.includes(credential.identityId)
        ) {
            return true;
        }
        return false;
    });

    const attachedAccounts = importedAccounts.filter((account) =>
        attachedIdentityIds.includes(account.identityId)
    );

    let identitiesWithUpdatedReferences: Identity[] = [];
    let accountsWithUpdatedReferences: Account[] = [];

    // Insert the new wallets into the database, and use their newly received
    // walletIds to update the identities and credentials that reference them.
    for (let i = 0; i < newWallets.length; i += 1) {
        const wallet = newWallets[i];

        const importedWalletId = wallet.id;
        const insertedWalletId = await insertWallet(
            wallet.identifier,
            wallet.type
        );

        identitiesWithUpdatedReferences = updateWalletIdReference(
            importedWalletId,
            insertedWalletId,
            attachedIdentities
        );
    }

    let credentialsWithUpdatedReferences: Credential[] = [];

    // Insert the new identities into the database, and use their newly received ids to update the
    // accounts and credentials that reference them.
    for (let i = 0; i < identitiesWithUpdatedReferences.length; i += 1) {
        const identityWithUpdateReference = identitiesWithUpdatedReferences[i];
        const importedIdentityId = identityWithUpdateReference.id;

        const insertedIdentityId = (
            await insertIdentity(identityWithUpdateReference)
        )[0];

        credentialsWithUpdatedReferences = updateIdentityIdReference(
            importedIdentityId,
            insertedIdentityId,
            attachedCredentials
        );
        accountsWithUpdatedReferences = updateIdentityIdReference(
            importedIdentityId,
            insertedIdentityId,
            attachedAccounts
        );
    }

    // At this point the accounts and credentials have updated references,
    // and can be directly inserted into the database.
    for (let i = 0; i < accountsWithUpdatedReferences.length; i += 1) {
        const accountWithUpdatedReference = accountsWithUpdatedReferences[i];
        await insertAccount(accountWithUpdatedReference);
    }

    for (let i = 0; i < credentialsWithUpdatedReferences.length; i += 1) {
        const credentialWithUpdatedReference =
            credentialsWithUpdatedReferences[i];
        // TODO Fix hack at some point.
        const { identityNumber, ...other } = credentialWithUpdatedReference;
        await insertCredential(other);
    }
}

async function importWallets(
    importedWallets: WalletEntry[],
    walletsFromDatabase: WalletEntry[],
    importedIdentities: Identity[],
    importedAccounts: Account[],
    importedCredentials: Credential[]
) {
    const [
        duplicateWalletEntries,
        nonDuplicateWalletEntries,
    ] = partition(importedWallets, (importedWallet) =>
        isDuplicate(importedWallet, walletsFromDatabase, ['id', 'identifier'])
    );

    // The duplicate wallet entries, are the ones that already exist in the database,
    // with a matching id and identifier. Therefore the wallets do not have to be imported,
    // but we must go through any attached identities and add them with updated ids if
    // anything new is available there.

    // TODO Add support for this.
    if (duplicateWalletEntries.length !== 0) {
        throw new Error(
            'Importing of data is only supported non-conflicting data.'
        );
    }

    // The wallets that are not exact duplicates of what is already present in the database, can
    // be split into two partitions:
    //      - Wallets that are in the database (they have equal identifier, which uniquely identifies them),
    //        but with a separate primary key (id field).
    //      - Wallets that are completely new to this database.
    const [existingWallets, newWallets] = partition(
        nonDuplicateWalletEntries,
        (nonDuplicateWalletEntry) =>
            isDuplicate(nonDuplicateWalletEntry, walletsFromDatabase, [
                'identifier',
            ])
    );

    // TODO Add support for this.
    if (existingWallets.length !== 0) {
        throw new Error(
            'Importing of data is only supported for non-conflicting data.'
        );
    }

    await importNewWallets(
        newWallets,
        importedIdentities,
        importedCredentials,
        importedAccounts
    );
}

export async function importEntries(
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
    await importWallets(
        importedData.wallets,
        existingWallets,
        importedData.identities,
        importedData.accounts,
        importedData.credentials
    );

    await importEntries(importedData.addressBook, existingData.addressBook);

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
