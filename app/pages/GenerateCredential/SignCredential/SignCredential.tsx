import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useController, useFormContext } from 'react-hook-form';
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
import errorMessages from '~/constants/errorMessages.json';

import generalStyles from '../GenerateCredential.module.scss';
import splitViewStyles from '../SplitViewRouter/SplitViewRouter.module.scss';
import styles from './SignCredential.module.scss';
import savedStateContext from '../savedStateContext';

interface Props {
    onSigned(): void;
}

/**
 * Component for creating the credential information. The user is prompted to sign
 * the necessary information to create it as part of the flow.
 */
export default function SignCredential({ onSigned }: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const { control } = useFormContext<AccountForm>();
    const {
        address,
        identity,
        chosenAttributes = [],
        credential: savedCredential,
    } = useContext(savedStateContext);
    const {
        field: { onChange, onBlur },
    } = useController({
        name: fieldNames.credential,
        rules: { required: true },
        defaultValue: savedCredential ?? null,
        control,
    });

    const shouldRedirect = !address || !identity;

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
        } else if (!address) {
            throw new Error(
                'An account adress has to be supplied. This is an internal error.'
            );
        } else if (!global) {
            throw new Error(errorMessages.missingGlobal);
        }

        const walletId = await pairWallet(ledger, dispatch);
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
            chosenAttributes as string[],
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
        onChange(blob);
        onBlur();
        setMessage('Credential generated succesfully!');
        onSigned();
    }

    return (
        <SimpleLedger
            className={clsx(
                generalStyles.card,
                splitViewStyles.sign,
                styles.root
            )}
            ledgerCall={sign}
        />
    );
}
