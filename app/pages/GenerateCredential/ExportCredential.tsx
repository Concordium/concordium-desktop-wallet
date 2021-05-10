import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { saveFile } from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { insertNewCredential } from '~/features/CredentialSlice';
import { addExternalAccount } from '~/features/AccountSlice';
import { findAccounts } from '~/database/AccountDao';
import AccountCredentialSummary from './AccountCredentialSummary';
import { AccountForm } from './types';

interface Props {
    onExported(didExport: boolean): void;
}

/**
 * Allows the user to export the created credentialInformation.
 */
export default function ExportCredential({ onExported }: Props): JSX.Element {
    const dispatch = useDispatch();
    const { getValues } = useFormContext<AccountForm>();
    const { credential } = getValues();

    useEffect(() => {
        onExported(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function saveCredential() {
        if (!credential?.credential) {
            throw new Error('unexpected missing credential');
        }

        const success = await saveFile(JSON.stringify(credential.credential), {
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
                    credential.identityId,
                    1
                );
            }
            onExported(true);
        }
    }

    return (
        <AccountCredentialSummary
            Button={() => <Button onClick={saveCredential}>Export</Button>}
        />
    );
}
