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
import {
    hasNoDuplicate,
    importWallets,
    ConflictTypes,
    NameResolver,
    ConflictMetadata,
    chooseName,
} from '~/utils/importHelpers';
import { partition } from '~/utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets } from '~/database/WalletDao';
import getGenesis from '~/database/GenesisDao';

type AddressBookEntryKey = keyof AddressBookEntry;

export const addressBookFields: AddressBookEntryKey[] = ['address'];

export async function importAddressBookEntries(
    dispatch: Dispatch,
    entries: AddressBookEntry[],
    addressBook: AddressBookEntry[],
    resolveConflict: NameResolver
) {
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
                update.name = await resolveConflict(
                    match.name,
                    duplicate.name,
                    { type: ConflictTypes.AddressbookName, address }
                );
            }
            if (!sameNote) {
                if (!duplicate.note || !match.note) {
                    update.note = duplicate.note || match.note;
                } else {
                    update.note = await resolveConflict(
                        match.note,
                        duplicate.note,
                        { type: ConflictTypes.AddressbookNote, address }
                    );
                }
            }
            updateAddressBookEntry(dispatch, address, update);
        }
    }
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
    resolveConflict: NameResolver
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
            importedData.credentials,
            resolveConflict
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

    if (importedData.externalCredentials) {
        const newExternalCredentials = [];
        for (const externalCredential of importedData.externalCredentials) {
            const match = existingData.externalCredentials.find(
                (cred) => cred.credId === externalCredential.credId
            );
            if (!match) {
                newExternalCredentials.push(externalCredential);
            } else if (match.note !== externalCredential.note) {
                const note = await resolveConflict(
                    match.note,
                    externalCredential.note,
                    { type: ConflictTypes.CredentialNote }
                );
                newExternalCredentials.push({ ...externalCredential, note });
            }
        }
        await importExternalCredentials(newExternalCredentials);
    }

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

    const [messages, setMessages] = useState<Record<string | number, string>>(
        {}
    );
    const [error, setError] = useState<string>();
    const [started, setStarted] = useState(false);

    async function resolveNameConflict(
        existingName: string,
        importName: string,
        metaData: ConflictMetadata
    ) {
        const { chosenName, identifier, message } = chooseName(
            existingName,
            importName,
            metaData
        );
        if (message) {
            setMessages((currentMessages) => {
                const newMap = { ...currentMessages };
                newMap[identifier] = message;
                return newMap;
            });
        }
        return chosenName;
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
                <p key={account.address}>
                    {account.name}{' '}
                    <span className="bodyLight">
                        {messages[account.address] &&
                            `(${messages[account.address]})`}
                    </span>
                </p>
            ));

    const AddressBookList = importedData.addressBook.map(
        (entry: AddressBookEntry) => (
            <p key={entry.address} className={styles.importedAddress}>
                {entry.name}{' '}
                <span className="bodyLight">
                    {messages[entry.address] && `(${messages[entry.address]})`}
                </span>
            </p>
        )
    );

    return (
        <>
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
                                <div className={styles.importedListInner}>
                                    {importedData.identities.map(
                                        (identity: Identity) => (
                                            <div
                                                key={identity.id}
                                                className={styles.importSection}
                                            >
                                                <h3 className="mB0">
                                                    <b>ID:</b> {identity.name}
                                                </h3>
                                                <p className="mT0 body3 bodyLight">
                                                    {messages[identity.id] &&
                                                        `(${
                                                            messages[
                                                                identity.id
                                                            ]
                                                        })`}
                                                </p>
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
