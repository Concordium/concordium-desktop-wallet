import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router';
import { saveFile } from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { insertNewCredential } from '~/features/CredentialSlice';
import { addExternalAccount } from '~/features/AccountSlice';
import { findAccounts } from '~/database/AccountDao';
import routes from '~/constants/routes.json';
import AccountCredentialSummary from './AccountCredentialSummary';
import savedStateContext from './savedStateContext';
import { CredentialExportFormat } from '~/utils/types';

interface Props {
    onExported(didExport: boolean): void;
}

/**
 * Allows the user to export the created credentialInformation.
 */
export default function ExportCredential({ onExported }: Props): JSX.Element {
    const dispatch = useDispatch();
    const { credential, accountName } = useContext(savedStateContext);

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
        });
        if (success) {
            insertNewCredential(
                dispatch,
                credential.address,
                credential.credentialNumber,
                credential.identityId,
                undefined,
                credential.credential
            );

            // The account may already exists, if the credential being exported is for an
            // internal account in the database. In that case a new one should not be created.
            const accountExists =
                (await findAccounts({ address: credential.address })).length >
                0;
            if (!accountExists) {
                addExternalAccount(
                    dispatch,
                    credential.address,
                    accountName || credential.address.substr(0, 8),
                    credential.identityId,
                    1
                );
            }
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
