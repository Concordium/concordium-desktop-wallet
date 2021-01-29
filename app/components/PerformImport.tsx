import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Grid, Card, Button, List, Header } from 'semantic-ui-react';
import { AddressBookEntry, Account, Identity } from '../utils/types';
import routes from '../constants/routes.json';
import { identitiesSelector } from '../features/IdentitySlice';
import { accountsSelector } from '../features/AccountSlice';
import { addressBookSelector } from '../features/AddressBookSlice';
import MessageModal from './MessageModal';
import {
    importIdentities,
    importAccounts,
    importEntries,
} from '../utils/importHelpers';

interface State {
    accounts: Account[];
    identities: Identity[];
    addressBook: AddressBookEntry[];
}

interface Location {
    state: State;
}

interface Props {
    location: Location;
}

async function performImport(importedData, existingData, setDuplicates) {
    let duplicates = await importIdentities(
        importedData.identities,
        existingData.identities
    );
    setDuplicates.identities(duplicates);
    duplicates = await importAccounts(
        importedData.accounts,
        existingData.accounts
    );
    setDuplicates.accounts(duplicates);
    duplicates = await importEntries(
        importedData.addressBook,
        existingData.addressBook
    );
    setDuplicates.addressBook(duplicates);
}

export default function PerformImport({ location }: Props) {
    const dispatch = useDispatch();
    const importedData = location.state;
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [duplicateIdentities, setDuplicateIdentities] = useState([]);
    const [duplicateAccounts, setDuplicateAccounts] = useState([]);
    const [duplicateEntries, setDuplicateEntries] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
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
            },
            setters
        ).catch(() => setOpen(true));
    }, [
        importedData,
        identities,
        accounts,
        addressBook,
        setDuplicateEntries,
        setDuplicateAccounts,
        setDuplicateIdentities,
    ]);

    const accountList = (identity) => (
        <List.List relaxed="false">
            {importedData.accounts
                .filter(
                    (account: Account) =>
                        parseInt(account.identityId, 10) ===
                        parseInt(identity.id, 10)
                )
                .map((account: Account) => (
                    <List.Item key={account.address}>
                        {account.name}
                        {duplicateAccounts.includes(account)
                            ? ' (Already existed)'
                            : ''}
                    </List.Item>
                ))}
        </List.List>
    );

    const AddressBookList = (
        <List size="big">
            <List.Item>
                <List.Header>Recipient accounts:</List.Header>
            </List.Item>
            {importedData.addressBook.map((entry: AddressBookEntry) => (
                <List.Item key={entry.address}>
                    {entry.name}
                    {duplicateEntries.includes(entry)
                        ? ' (Already existed)'
                        : ''}
                </List.Item>
            ))}
        </List>
    );

    return (
        <>
            <MessageModal
                title="Unable to complete import!"
                buttonText="return!"
                onClose={() => dispatch(push(routes.EXPORTIMPORT))}
                open={open}
            />
            <Grid columns="equal" divided>
                <Grid.Column>
                    <Card fluid style={{ height: '75vh' }}>
                        <Card.Header textAlign="center">
                            Import successful
                        </Card.Header>
                        <Card.Description>
                            That’s it! Your import completed successfully.
                        </Card.Description>
                        <Card.Content extra>
                            <Button
                                primary
                                onClick={() =>
                                    dispatch(push(routes.EXPORTIMPORT))
                                }
                            >
                                Okay, Thanks!
                            </Button>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column>
                    <List size="big" relaxed="very">
                        {importedData.identities.map((identity: Identity) => (
                            <List.Item key={identity.id}>
                                <List.Header>
                                    ID: {identity.name}
                                    {duplicateIdentities.includes(identity)
                                        ? ' (Already existed)'
                                        : ''}
                                </List.Header>
                                <List.Content>
                                    Accounts:
                                    {accountList(identity)}
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                    <Header>Address Book</Header>
                    {AddressBookList}
                </Grid.Column>
            </Grid>
        </>
    );
}
