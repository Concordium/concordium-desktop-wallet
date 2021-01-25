import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { Modal, Grid, Card, Button, List, Header } from 'semantic-ui-react';
import { AddressBookEntry, Account, Identity } from '../utils/types';
import routes from '../constants/routes.json';
import { identitiesSelector, importIdentity } from '../features/IdentitySlice';
import { accountsSelector, importAccount } from '../features/AccountSlice';
import { addressBookSelector, importEntry } from '../features/AddressBookSlice';

const identityFields = ['id', 'name', 'randomness']; // TODO more
const accountFields = [
    'name',
    'address',
    'accountNumber',
    'identityId',
    'credential',
];
const addressBookFields = ['name', 'address', 'note'];

function checkDuplicates(entry, list, fields, commonFields = undefined) {
    const allEqual = list.find((abe) =>
        fields.map((field) => abe[field] === entry[field]).every(Boolean)
    );

    if (allEqual) {
        return false;
    }

    if (commonFields === undefined) {
        return true;
    }

    const anyEqual = list.find((abe) =>
        fields
            .filter((field) => !commonFields.includes(field))
            .map((field) => abe[field] === entry[field])
            .some(Boolean)
    );

    if (anyEqual) {
        throw new Error('disallowed'); // TODO use custom error
    }

    // TODO inform commonField collision

    return true;
}

async function importIdentities(
    newIdentities,
    existingIdentities
): Promise<void> {
    const nonDuplicates = newIdentities.filter((newIdentity) =>
        checkDuplicates(newIdentity, existingIdentities, identityFields, [])
    );
    if (nonDuplicates.length > 0) {
        return importIdentity(nonDuplicates);
    }
    return undefined;
}

async function importAccounts(newAccounts, existingAccounts): Promise<void> {
    const nonDuplicates = newAccounts.filter((newAccount) =>
        checkDuplicates(newAccount, existingAccounts, accountFields, [])
    );
    if (nonDuplicates.length > 0) {
        return importAccount(nonDuplicates);
    }
    return undefined;
}

function importEntries(entries, addressBook): Promise<void> {
    const nonDuplicates = entries.filter((entry) =>
        checkDuplicates(entry, addressBook, addressBookFields, ['note'])
    );
    if (nonDuplicates.length > 0) {
        return importEntry(nonDuplicates);
    }
    return undefined;
}

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

export default function Importing({ location }: Props) {
    const dispatch = useDispatch();
    const data = location.state;
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);
    const addressBook = useSelector(addressBookSelector);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        importIdentities(data.identities, identities)
            .then(() => {
                return importAccounts(data.accounts, accounts);
            })
            .catch(() => setOpen(true));
        importEntries(data.addressBook, addressBook);
    }, [data, accounts, identities, addressBook, dispatch, setOpen]);

    return (
        <Grid columns="equal" divided>
            <Modal
                closeIcon
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                dimmer="blurring"
                closeOnDimmerClick={false}
            >
                <Modal.Header>Unable to complete import!</Modal.Header>
                <Modal.Content>
                    <Button onClick={() => dispatch(push(routes.EXPORTIMPORT))}>
                        return
                    </Button>
                </Modal.Content>
            </Modal>
            <Grid.Column>
                <Card fluid style={{ height: '75vh' }}>
                    <Card.Header textAlign="center">
                        Import succesful
                    </Card.Header>
                    <Card.Description>
                        That’s it! Your import completed successfully.
                    </Card.Description>
                    <Card.Content extra>
                        <Button
                            primary
                            onClick={() => dispatch(push(routes.EXPORTIMPORT))}
                        >
                            Okay, Thanks!
                        </Button>
                    </Card.Content>
                </Card>
            </Grid.Column>
            <Grid.Column>
                <List size="big" relaxed="very">
                    {data.identities.map((identity: Identity) => (
                        <List.Item key={identity.id}>
                            <List.Header>
                                ID: {identity.name}{' '}
                                {checkDuplicates(
                                    identity,
                                    identities,
                                    identityFields
                                )
                                    ? ''
                                    : '(Already Exists)'}
                            </List.Header>
                            <List.Content>
                                Accounts:
                                <List.List relaxed="false">
                                    {data.accounts
                                        .filter(
                                            (account: Account) =>
                                                parseInt(
                                                    account.identityId,
                                                    10
                                                ) === parseInt(identity.id, 10)
                                        )
                                        .map((account: Account) => (
                                            <List.Item key={account.address}>
                                                {account.name}{' '}
                                                {checkDuplicates(
                                                    account,
                                                    accounts,
                                                    accountFields
                                                )
                                                    ? ''
                                                    : '(Already Exists)'}
                                            </List.Item>
                                        ))}
                                </List.List>
                            </List.Content>
                        </List.Item>
                    ))}
                </List>
                <Header>Address Book</Header>
                <List size="big">
                    <List.Item>
                        <List.Header>Recipient accounts:</List.Header>
                    </List.Item>
                    {data.addressBook.map((entry: AddressBookEntry) => (
                        <List.Item key={entry.address}>
                            {entry.name}{' '}
                            {checkDuplicates(
                                entry,
                                addressBook,
                                addressBookFields
                            )
                                ? ''
                                : '(Already Exists)'}
                        </List.Item>
                    ))}
                </List>
            </Grid.Column>
        </Grid>
    );
}
