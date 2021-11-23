import React, { useContext, useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useController, useFormContext } from 'react-hook-form';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { createCredentialInfo } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { globalSelector } from '~/features/GlobalSlice';
import pairWallet from '~/utils/WalletPairing';
import { AccountForm, CredentialBlob, fieldNames } from '../types';
import { CreationKeys } from '~/utils/types';
import errorMessages from '~/constants/errorMessages.json';
import SimpleLedgerWithCreationKeys from '~/components/ledger/SimpleLedgerWithCreationKeys';

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

    const [credentialNumber, setCredentialNumber] = useState<number>();
    useEffect(() => {
        if (identity?.id === undefined) {
            throw new Error(
                'An identity has to be supplied. This is an internal error.'
            );
        }
        getNextCredentialNumber(identity.id)
            .then(setCredentialNumber)
            .catch(() => {
                throw new Error('Unable to read from database.');
            });
    }, [identity?.id]);

    const sign = useCallback(
        (keys: CreationKeys) => {
            return async (
                ledger: ConcordiumLedgerClient,
                setMessage: (message: string | JSX.Element) => void
            ) => {
                setMessage('Please wait');
                if (!credentialNumber) {
                    throw new Error(
                        'The credentialNumber has to be supplied. This is an internal error.'
                    );
                }
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

                const {
                    info: credential,
                    randomness,
                } = await createCredentialInfo(
                    identity,
                    credentialNumber,
                    keys,
                    global,
                    chosenAttributes as string[],
                    setMessage,
                    ledger,
                    address
                );
                const blob: CredentialBlob = {
                    credential,
                    randomness,
                    address,
                    credentialNumber,
                    identityId: identity.id,
                };
                onChange(blob);
                onBlur();
                setMessage('Credential generated succesfully!');
                onSigned();
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [global, credentialNumber, identity, address, chosenAttributes]
    );

    async function checkWallet(ledger: ConcordiumLedgerClient) {
        const walletId = await pairWallet(ledger, dispatch);
        if (walletId !== identity?.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
        }
    }

    if (!address || !identity) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    return (
        <SimpleLedgerWithCreationKeys
            identityNumber={identity.identityNumber}
            className={clsx(
                generalStyles.card,
                splitViewStyles.sign,
                styles.root,
                'textCenter flexColumn'
            )}
            compareButtonClassName={styles.compareButton}
            ledgerCallback={sign}
            credentialNumber={credentialNumber}
            preCallback={checkWallet}
            identityVersion={identity.version}
        />
    );
}
