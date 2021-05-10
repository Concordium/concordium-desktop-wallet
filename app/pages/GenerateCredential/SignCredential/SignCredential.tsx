import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { createCredentialInfo } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { globalSelector } from '~/features/GlobalSlice';
import pairWallet from '~/utils/WalletPairing';
import { AccountForm, CredentialBlob, fieldNames } from '../types';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './SignCredential.module.scss';

/**
 * Component for creating the credential information. The user is prompted to sign
 * the necessary information to create it as part of the flow.
 */
export default function SignCredential(): JSX.Element {
    const global = useSelector(globalSelector);
    const { getValues, register, setValue } = useFormContext<AccountForm>();

    const { address, identity, chosenAttributes } = getValues();
    const shouldRedirect = !address || !identity;

    useEffect(() => {
        if (!shouldRedirect) {
            register(fieldNames.credential, { required: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldRedirect) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!identity) {
            throw new Error(
                'An identity has to be supplied. This is an internal error.'
            );
        } else if (!global) {
            throw new Error(
                'The global information is missing. Make sure that you have previously connected to a node.'
            );
        }

        const walletId = await pairWallet(ledger);
        if (walletId !== identity.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
        }

        const credentialNumber = await getNextCredentialNumber(identity.id);
        const credential = await createCredentialInfo(
            identity,
            credentialNumber,
            global,
            chosenAttributes,
            setMessage,
            ledger,
            address
        );
        const blob: CredentialBlob = {
            credential,
            address,
            credentialNumber,
            identityId: identity.id,
        };
        setValue(fieldNames.credential, blob, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setMessage('Credential generated succesfully!');
    }

    return (
        <div className={clsx(generalStyles.card, styles.root)}>
            <SimpleLedger ledgerCall={sign} />
        </div>
    );
}
