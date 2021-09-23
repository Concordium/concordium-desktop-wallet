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
    addressBookSelector,
} from '~/features/AddressBookSlice';
import {
    credentialsSelector,
    externalCredentialsSelector,
    loadCredentials,
    loadExternalCredentials,
} from '~/features/CredentialSlice';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import {
    importWallets,
    AddMessage,
    insertExternalCredentials,
    importAddressBookEntries,
} from '~/utils/importHelpers';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import styles from './ExportImport.module.scss';
import { getAllWallets } from '~/database/WalletDao';
import getGenesis from '~/database/GenesisDao';

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
    addMessage: AddMessage
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
            addMessage
        );
    } catch (e) {
        throw new Error(
            'The imported data is not compatible with existing data.'
        );
    }
    let duplicateAddressBookEntries;
    try {
        duplicateAddressBookEntries = await importAddressBookEntries(
            dispatch,
            importedData.addressBook,
            existingData.addressBook,
            addMessage
        );
    } catch (e) {
        throw new Error(
            'The imported address book is not compatible with existing address book.'
        );
    }

    // Older imports doesn't contain external credentials, so only add them if the field is present.
    if (importedData.externalCredentials) {
        await insertExternalCredentials(
            importedData.externalCredentials,
            existingData.externalCredentials
        );
    }

    await loadIdentities(dispatch);
    await loadAccounts(dispatch);
    await loadAddressBook(dispatch);
    await loadCredentials(dispatch);
    await loadExternalCredentials(dispatch);

    return duplicateAddressBookEntries;
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

    const [
        duplicateAddressBookEntries,
        setDuplicateAddressBookEntries,
    ] = useState<AddressBookEntry[]>([]);
    const [messages, setMessages] = useState<Record<string | number, string>>(
        {}
    );
    const [error, setError] = useState<string>();
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!started && importedData) {
            const addMessage = (identifier: string | number, message: string) =>
                setMessages((currentMessages) => {
                    const newMap = { ...currentMessages };
                    newMap[identifier] = message;
                    return newMap;
                });
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
                addMessage
            )
                .then(setDuplicateAddressBookEntries)
                .catch((e) => setError(e.message));
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
        setMessages,
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
                    {messages[account.address] && (
                        <span className="bodyLight textFaded mL10">
                            ({messages[account.address]})
                        </span>
                    )}
                </p>
            ));

    const AddressBookList = importedData.addressBook
        .filter(
            (abe) =>
                !duplicateAddressBookEntries.some(
                    (dAbe) => abe.address === dAbe.address
                )
        )
        .map((entry: AddressBookEntry) => (
            <p key={entry.address} className={styles.importedAddress}>
                {entry.name}{' '}
                {messages[entry.address] && (
                    <span className="bodyLight textFaded mL10">
                        ({messages[entry.address]})
                    </span>
                )}
            </p>
        ));

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
                                                <h3 className="mB10">
                                                    <b>ID:</b> {identity.name}{' '}
                                                    {messages[identity.id] && (
                                                        <span className="bodyLight textFaded mL10">
                                                            (
                                                            {
                                                                messages[
                                                                    identity.id
                                                                ]
                                                            }
                                                            )
                                                        </span>
                                                    )}
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
                                        {duplicateAddressBookEntries.length !==
                                            0 && (
                                            <p>
                                                (
                                                {
                                                    duplicateAddressBookEntries.length
                                                }{' '}
                                                recipient account
                                                {duplicateAddressBookEntries.length >
                                                1
                                                    ? 's were not imported, as they already exist'
                                                    : ' was not imported, as it already exists'}
                                                )
                                            </p>
                                        )}
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
