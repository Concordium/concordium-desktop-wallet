import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import { Redirect } from 'react-router';
import Button from '~/cross-app-components/Button';
import {
    AddressBookEntry,
    Account,
    Identity,
    ExportData,
    Dispatch,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { loadIdentities, identitiesSelector } from '~/features/IdentitySlice';
import { loadAccounts, accountsSelector } from '~/features/AccountSlice';
import {
    loadAddressBook,
    importAddressBookEntry,
    addressBookSelector,
    updateAddressBookEntry,
} from '~/features/AddressBookSlice';
import {
    credentialsSelector,
    externalCredentialsSelector,
    importExternalCredentials,
    loadCredentials,
    loadExternalCredentials,
} from '~/features/CredentialSlice';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { hasNoDuplicate, importWallets } from '~/utils/importHelpers';
import { partition } from '~/utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets } from '~/database/WalletDao';
import getGenesis from '~/database/GenesisDao';
import ResolveModal, { ResolveModalInput } from './ResolveModal';

type AddressBookEntryKey = keyof AddressBookEntry;

export const addressBookFields: AddressBookEntryKey[] = ['address'];

export async function importAddressBookEntries(
    dispatch: Dispatch,
    entries: AddressBookEntry[],
    addressBook: AddressBookEntry[],
    resolveConflict: (names: string[]) => Promise<string>
): Promise<AddressBookEntry[]> {
    const [nonDuplicates, duplicates] = partition(entries, (entry) =>
        hasNoDuplicate(entry, addressBook, addressBookFields)
    );
    if (nonDuplicates.length > 0) {
        await importAddressBookEntry(nonDuplicates);
    }
    if (duplicates.length > 0) {
        for (const duplicate of duplicates) {
            const { address } = duplicate;
            const match = addressBook.find((abe) => abe.address === address);
            if (!match) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const sameName = duplicate.name === match.name;
            const sameNote = duplicate.note === match.note;
            if (sameName && sameNote) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const update: Partial<AddressBookEntry> = {};
            if (!sameName) {
                update.name = await resolveConflict([
                    duplicate.name,
                    match.name,
                ]);
            }
            if (!sameNote) {
                if (!duplicate.note || !match.note) {
                    update.note = duplicate.note || match.note;
                } else {
                    update.note = await resolveConflict([
                        duplicate.note,
                        match.note,
                    ]);
                }
            }
            updateAddressBookEntry(dispatch, address, update);
        }
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
    dispatch: Dispatch,
    resolveConflict: (names: string[]) => Promise<string>
) {
    if (importedData.genesis) {
        const genesis = await getGenesis();
        if (!genesis) {
            throw new Error(
                'The imported data exists on a specific network, please connect to a node on the same network before importing the data.'
            );
        }

        if (genesis.genesisBlock !== importedData.genesis.genesisBlock) {
            throw new Error(
                'The imported data was created on a different network.'
            );
        }
    }

    const existingWallets = await getAllWallets();
    const existingDataWithWallets = {
        ...existingData,
        wallets: existingWallets,
    };

    try {
        await importWallets(
            existingDataWithWallets,
            importedData.wallets,
            importedData.identities,
            importedData.accounts,
            importedData.credentials
        );
    } catch (e) {
        throw new Error(
            'The imported data is not compatible with existing data.'
        );
    }

    try {
        await importAddressBookEntries(
            dispatch,
            importedData.addressBook,
            existingData.addressBook,
            resolveConflict
        );
    } catch (e) {
        throw new Error(
            'The imported address book is not compatible with existing address book.'
        );
    }

    await importExternalCredentials(importedData.externalCredentials);

    await loadIdentities(dispatch);
    await loadAccounts(dispatch);
    await loadAddressBook(dispatch);
    await loadCredentials(dispatch);
    await loadExternalCredentials(dispatch);
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
    const externalCredentials = useSelector(externalCredentialsSelector);

    const [error, setError] = useState<string>();
    const [showConflict, setShowConflict] = useState<ResolveModalInput>({
        open: false,
    });
    const [started, setStarted] = useState(false);

    function resolveNameConflict(names: string[]) {
        return new Promise<string>((resolve) => {
            setShowConflict({
                open: true,
                header: 'Please resolve conflict',
                choices: names,
                onResolve: (chosenName: string) => {
                    setShowConflict({ open: false });
                    resolve(chosenName);
                },
            });
        });
    }

    useEffect(() => {
        if (!started && importedData) {
            setStarted(true);
            performImport(
                importedData,
                {
                    identities,
                    accounts,
                    addressBook,
                    credentials,
                    externalCredentials,
                    wallets: [],
                },
                dispatch,
                resolveNameConflict
            ).catch((e) => setError(e.message));
        }
    }, [
        importedData,
        identities,
        accounts,
        credentials,
        externalCredentials,
        addressBook,
        dispatch,
        started,
    ]);

    if (!importedData) {
        return <Redirect to={routes.EXPORTIMPORT} />;
    }

    const accountList = (identity: Identity) =>
        importedData.accounts
            .filter((account: Account) => account.identityId === identity.id)
            .map((account: Account) => (
                <p key={account.address}>{account.name}</p>
            ));

    const AddressBookList = importedData.addressBook.map(
        (entry: AddressBookEntry) => (
            <p key={entry.address} className={styles.importedAddress}>
                {entry.name}
            </p>
        )
    );

    return (
        <>
            <ResolveModal {...showConflict} />
            <SimpleErrorModal
                header="Unable to complete import"
                content={error}
                onClick={() => dispatch(push(routes.EXPORTIMPORT))}
                show={Boolean(error)}
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
                                <div>
                                    <CheckmarkIcon
                                        className={styles.checkmark}
                                    />
                                    <p>
                                        That’s it! Your import completed
                                        successfully.
                                    </p>
                                </div>
                                <Button
                                    onClick={() =>
                                        dispatch(push(routes.EXPORTIMPORT))
                                    }
                                >
                                    Okay, thanks!
                                </Button>
                            </div>
                        </Columns.Column>
                        <Columns.Column>
                            <div className={styles.importedList}>
                                <div className="flexChildFill flexColumn justifyCenter">
                                    {importedData.identities.map(
                                        (identity: Identity) => (
                                            <div
                                                key={identity.id}
                                                className={styles.importSection}
                                            >
                                                <h3>
                                                    <b>ID:</b> {identity.name}
                                                </h3>
                                                <div
                                                    className={
                                                        styles.importedAccounts
                                                    }
                                                >
                                                    <p className={styles.bold}>
                                                        Accounts:
                                                    </p>
                                                    {accountList(identity)}
                                                </div>
                                            </div>
                                        )
                                    )}
                                    <div className={styles.importSection}>
                                        <h3>Address book</h3>
                                        <p
                                            className={clsx(
                                                styles.bold,
                                                styles.importedAddress
                                            )}
                                        >
                                            Recipient accounts:
                                        </p>
                                        {AddressBookList}
                                    </div>
                                </div>
                            </div>
                        </Columns.Column>
                    </Columns>
                </PageLayout.Container>
            </PageLayout>
        </>
    );
}
