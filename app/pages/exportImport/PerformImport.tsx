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
    updateWalletIdReference,
} from '../../utils/importHelpers';
import { partition } from '../../utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets, insertWallet } from '~/database/WalletDao';
import { insertIdentity } from '~/database/IdentityDao';
import { getAccountsOfIdentity, insertAccount } from '~/database/AccountDao';
import {
    getCredentialsForIdentity,
    insertCredential,
} from '~/database/CredentialDao';

type IdentityKey = keyof Identity;
type AccountKey = keyof Account;
type AddressBookEntryKey = keyof AddressBookEntry;
type CredentialKey = keyof Credential;

interface AttachedEntities {
    attachedIdentities: Identity[];
    attachedCredentials: Credential[];
    attachedAccounts: Account[];
}

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
 * Finds the accounts and credentials that refer to a specific identityId.
 */
function findAccountsAndCredentialsOnIdentity(
    identityId: number,
    accounts: Account[],
    credentials: Credential[]
) {
    const accountsOnIdentity = accounts.filter(
        (account) => identityId === account.identityId
    );
    const credentialsOnIdentity = credentials.filter(
        (credential) => identityId === credential.identityId
    );
    return { accountsOnIdentity, credentialsOnIdentity };
}

/**
 * Finds the identities, credentials and accounts that are attached to one of the
 * provided wallets.
 */
function findAttachedEntities(
    wallets: WalletEntry[],
    importedIdentities: Identity[],
    importedCredentials: Credential[],
    importedAccounts: Account[]
): AttachedEntities {
    const walletIds = wallets.map((wallet) => wallet.id);

    const attachedIdentities = importedIdentities.filter((identity) =>
        walletIds.includes(identity.walletId)
    );
    const attachedIdentityIds = attachedIdentities.map(
        (attachedIdent) => attachedIdent.id
    );

    const attachedCredentials = importedCredentials.filter((credential) =>
        attachedIdentityIds.includes(credential.identityId)
    );

    const attachedAccounts = importedAccounts.filter((account) =>
        attachedIdentityIds.includes(account.identityId)
    );

    return { attachedIdentities, attachedCredentials, attachedAccounts };
}

/**
 * Inserts an array of new identities and its attached accounts and credentials. The identities
 * must be new identities that did not already exist in the database. The accounts and credentials for
 * each identity in the array will have their identityId reference updated to point to the
 * correct id for their identity, before they are also inserted into the database.
 *
 * Note that for new identities that there cannot be existing account or credentials, so we
 * can safely insert them without checking if they already exist.
 * @param newIdentities an array of new identities to be added to the database
 * @param attachedAccounts all accounts for the current wallet import, without any changes to their identityId
 * @param attachedCredentials all credentials for the current wallet import, without any changes to their identityId
 */
async function insertNewIdentities(
    newIdentities: Identity[],
    attachedAccounts: Account[],
    attachedCredentials: Credential[]
) {
    for (let i = 0; i < newIdentities.length; i += 1) {
        const { id, ...newIdentity } = newIdentities[i];

        const newIdentityId = (await insertIdentity(newIdentity))[0];

        const {
            accountsOnIdentity,
            credentialsOnIdentity,
        } = findAccountsAndCredentialsOnIdentity(
            id,
            attachedAccounts,
            attachedCredentials
        );
        for (let j = 0; j < accountsOnIdentity.length; j += 1) {
            const newAccountToInsert: Account = {
                ...accountsOnIdentity[j],
                identityId: newIdentityId,
            };
            await insertAccount(newAccountToInsert);
        }

        for (let k = 0; k < credentialsOnIdentity.length; k += 1) {
            const newCredentialToInsert = {
                ...credentialsOnIdentity[k],
                identityId: newIdentityId,
            };
            // TODO Remove hack, when the identityNumber is not in the export.
            const { identityNumber, ...other } = newCredentialToInsert;
            await insertCredential(other);
        }
    }
}

/**
 * Imports a list of completely new wallets, i.e. wallets that cannot be matched with
 * a wallet entry currently in the database. The logical ids of the wallets and identities
 * may change when inserted into the database, which means that the references between objects
 * are also updated as part of the import.
 * @param newWallets the wallets that are new to this database
 * @param importedIdentities the total list of identities currently being imported
 */
// TODO This method should be a single transaction. Implement this when we change the SQLite dependency.
async function importNewWallets(
    newWallets: WalletEntry[],
    importedIdentities: Identity[],
    importedCredentials: Credential[],
    importedAccounts: Account[]
) {
    const {
        attachedIdentities,
        attachedCredentials,
        attachedAccounts,
    } = findAttachedEntities(
        newWallets,
        importedIdentities,
        importedCredentials,
        importedAccounts
    );

    let identitiesWithUpdatedReferences: Identity[] = [];

    // Insert the new wallets into the database, and use their newly received
    // walletIds to update the identities and credentials that reference them.
    for (let i = 0; i < newWallets.length; i += 1) {
        const wallet = newWallets[i];

        const importedWalletId = wallet.id;
        const insertedWalletId = await insertWallet(
            wallet.identifier,
            wallet.type
        );

        const identitiesWithUpdatedWalletIds = updateWalletIdReference(
            importedWalletId,
            insertedWalletId,
            attachedIdentities
        );
        identitiesWithUpdatedReferences = identitiesWithUpdatedReferences.concat(
            identitiesWithUpdatedWalletIds
        );
    }

    await insertNewIdentities(
        identitiesWithUpdatedReferences,
        attachedAccounts,
        attachedCredentials
    );
}

/**
 * Import identities, accounts and credentials for the wallets that already exist in the database
 * with an identical logical id. This means that the walletId reference on the identities do not
 * have to be updated, as they are already correct in this special case.
 */
async function importDuplicateWallets(
    existingData: ExportData,
    duplicateWallets: WalletEntry[],
    importedIdentities: Identity[],
    importedCredentials: Credential[],
    importedAccounts: Account[]
) {
    const {
        attachedIdentities,
        attachedCredentials,
        attachedAccounts,
    } = findAttachedEntities(
        duplicateWallets,
        importedIdentities,
        importedCredentials,
        importedAccounts
    );

    // Partition the identities into those that match the existing data, and those that
    // do not.
    const [duplicateIdentities, nonDuplicateIdentities] = partition(
        attachedIdentities,
        (attachedIdentity) =>
            // TODO Any reason to not also check on identityObject?
            isDuplicate(attachedIdentity, existingData.identities, [
                'id',
                'identityNumber',
                'name',
                'randomness',
            ])
    );

    // For the identities that are one-to-one with what is in the database, we still have to
    // check if there are new accounts or credentials and add them to the database.
    for (let i = 0; i < duplicateIdentities.length; i += 1) {
        const identityId = duplicateIdentities[i].id;

        const {
            accountsOnIdentity,
            credentialsOnIdentity,
        } = findAccountsAndCredentialsOnIdentity(
            identityId,
            attachedAccounts,
            attachedCredentials
        );
        const existingAccountAddressesInDatabase = (
            await getAccountsOfIdentity(identityId)
        ).map((account) => account.address);
        const existingCredentialIdsInDatabase = (
            await getCredentialsForIdentity(identityId)
        ).map((credential) => credential.credId);

        // Find any accounts that do not already exist in the database, and add them if there are any.
        // The accounts that are already in the database should not be updated by the import, as they
        // do not carry new information that cannot be gathered from the current entry.
        const newAccounts = accountsOnIdentity.filter((accountOnIdentity) =>
            existingAccountAddressesInDatabase.includes(
                accountOnIdentity.address
            )
        );
        for (let j = 0; j < newAccounts.length; j += 1) {
            const newAccountToInsert = newAccounts[j];
            await insertAccount(newAccountToInsert);
        }

        // Find any credentials that do not already exist in the database, and add them if there are any.
        // The credentials that are already in the database should not be updated by the import, as they
        // do not carry new information that cannot be gathered from the current entry.
        const newCredentials = credentialsOnIdentity.filter(
            (credentialOnIdentity) =>
                existingCredentialIdsInDatabase.includes(
                    credentialOnIdentity.credId
                )
        );
        for (let k = 0; k < newCredentials.length; k += 1) {
            await insertCredential(newCredentials[k]);
        }
    }

    // The identities that are not duplicate can be partitioned into the set
    // of identities that exist in the database, but with separate logical ids,
    // and those identities that are entirely new to this database.
    const [
        existingIdentities,
        newIdentities,
    ] = partition(nonDuplicateIdentities, (nonDuplicateIdentity) =>
        isDuplicate(nonDuplicateIdentity, existingData.identities, [
            'identityNumber',
            'name',
            'randomness',
        ])
    );

    // For the existing identities find the identityId that they now have, and update that on the associated
    // accounts and credentials before inserting them into the database.
    for (let i = 0; i < existingIdentities.length; i += 1) {
        const existingIdentity = existingIdentities[i];

        // Find the identity id as it is in the database.
        const newIdentity = existingData.identities.find((ident) => {
            if (
                ident.identityNumber === existingIdentity.identityNumber &&
                ident.name === existingIdentity.name &&
                ident.randomness === existingIdentity.randomness
            ) {
                return true;
            }
            return false;
        });

        if (!newIdentity) {
            throw new Error(
                'Internal error. An existing and matching identity should have been found, but was not.'
            );
        }

        const newIdentityId = newIdentity.id;

        // TODO Generalize, as this is an almost duplicate of the code above, except that it also updates the identityId (so that could be given as input to a function).

        const {
            accountsOnIdentity,
            credentialsOnIdentity,
        } = findAccountsAndCredentialsOnIdentity(
            existingIdentity.id,
            attachedAccounts,
            attachedCredentials
        );
        const existingAccountAddressesInDatabase = (
            await getAccountsOfIdentity(newIdentityId)
        ).map((account) => account.address);
        const existingCredentialIdsInDatabase = (
            await getCredentialsForIdentity(newIdentityId)
        ).map((credential) => credential.credId);

        // Find any accounts that do not already exist in the database, and add them if there are any.
        // The accounts that are already in the database should not be updated by the import, as they
        // do not carry new information that cannot be gathered from the current entry.
        const newAccounts = accountsOnIdentity.filter((accountOnIdentity) =>
            existingAccountAddressesInDatabase.includes(
                accountOnIdentity.address
            )
        );
        for (let j = 0; j < newAccounts.length; j += 1) {
            const newAccountToInsert: Account = {
                ...newAccounts[j],
                identityId: newIdentityId,
            };
            await insertAccount(newAccountToInsert);
        }

        // Find any credentials that do not already exist in the database, and add them if there are any.
        // The credentials that are already in the database should not be updated by the import, as they
        // do not carry new information that cannot be gathered from the current entry.
        const newCredentials = credentialsOnIdentity.filter(
            (credentialOnIdentity) =>
                existingCredentialIdsInDatabase.includes(
                    credentialOnIdentity.credId
                )
        );
        for (let k = 0; k < newCredentials.length; k += 1) {
            const newCredentialToInsert = {
                ...newCredentials[k],
                identityId: newIdentityId,
            };
            await insertCredential(newCredentialToInsert);
        }
    }

    await insertNewIdentities(
        newIdentities,
        attachedAccounts,
        attachedCredentials
    );
}

async function importWallets(
    walletsFromDatabase: WalletEntry[],
    existingData: ExportData,
    importedWallets: WalletEntry[],
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

    // The duplicate wallet entries are the wallets that already exist in the database,
    // with an exact match on both the id and identifier. Therefore we do not have to
    // insert those wallets (they are already there), but we have to check if there are
    // any new identities, accounts or credentials.
    await importDuplicateWallets(
        existingData,
        duplicateWalletEntries,
        importedIdentities,
        importedCredentials,
        importedAccounts
    );

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
    // It might be possible to re-use the import of duplicate wallets, if the walletId references
    // on the identities are updated - afterwards it should be an identical case, as we need to check
    // if the identities already exist or not etc.
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
        existingWallets,
        existingData,
        importedData.wallets,
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
            ).catch((e) => {
                console.log(e);
                setOpen(true);
            });
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
