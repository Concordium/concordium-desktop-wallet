import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import saveFile from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import {
    addToAddressBook,
    addressBookSelector,
} from '~/features/AddressBookSlice';
import { insertNewCredential } from '~/features/CredentialSlice';
import { addExternalAccount } from '~/features/AccountSlice';
import { findAccounts } from '~/database/AccountDao';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from './AccountCredentialSummary';
import savedStateContext from './savedStateContext';
import { CredentialExportFormat, CredentialStatus } from '~/utils/types';

interface Props {
    onExported(didExport: boolean): void;
}

/**
 * Allows the user to export the created credentialInformation.
 */
export default function ExportCredential({ onExported }: Props): JSX.Element {
    const dispatch = useDispatch();
    const addressBook = useSelector(addressBookSelector);
    const { credential, accountName } = useContext(savedStateContext);
    const [hasExported, setHasExported] = useState(false);

    useEffect(() => {
        onExported(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function saveCredential() {
        if (!credential?.credential) {
            throw new Error('unexpected missing credential');
        }

        const exportData: CredentialExportFormat = {
            credential: credential.credential,
            address: credential.address,
        };

        const success = await saveFile(JSON.stringify(exportData), {
            title: 'Save credential',
            defaultPath: `credential-to-${credential.address.substring(
                0,
                8
            )}.json`,
        });
        if (success && !hasExported) {
            insertNewCredential(
                dispatch,
                credential.address,
                credential.credentialNumber,
                credential.identityId,
                undefined,
                CredentialStatus.Pending,
                credential.credential
            );
            const name = accountName || credential.address.substr(0, 8);
            const { address } = credential;

            // The account may already exists, if the credential being exported is for an
            // internal account in the database. In that case a new one should not be created.
            const accountExists = (await findAccounts({ address })).length > 0;
            if (!accountExists) {
                addExternalAccount(
                    dispatch,
                    address,
                    name,
                    credential.identityId,
                    1
                );
            }
            if (!addressBook.some((abe) => abe.address === address)) {
                addToAddressBook(dispatch, {
                    readOnly: true,
                    name,
                    address,
                    note: 'Shared account',
                });
            }

            setHasExported(true);
            onExported(true);
        }
    }

    if (!credential) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    return (
        <AccountCredentialSummary
            Button={() => <Button onClick={saveCredential}>Export</Button>}
        />
    );
}
