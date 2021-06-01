import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useController, useFormContext } from 'react-hook-form';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import {
    createCredentialInfo,
    exportKeysFromLedger,
} from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { globalSelector } from '~/features/GlobalSlice';
import pairWallet from '~/utils/WalletPairing';
import { AccountForm, CredentialBlob, fieldNames } from '../types';
import { CreationKeys } from '~/utils/types';
import errorMessages from '~/constants/errorMessages.json';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';

import generalStyles from '../GenerateCredential.module.scss';
import splitViewStyles from '../SplitViewRouter/SplitViewRouter.module.scss';
import styles from './SignCredential.module.scss';
import savedStateContext from '../savedStateContext';

interface Props {
    onSigned(): void;
}

type KeysAndCredentialNumber = CreationKeys & { credentialNumber: number };

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

    const [keys, setKeys] = useState<KeysAndCredentialNumber>();
    const [finishedComparing, setFinishedComparing] = useState(false);

    const shouldRedirect = !address || !identity;

    if (shouldRedirect) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    async function exportKeys(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string | JSX.Element) => void
    ) {
        let credentialNumber;
        if (!identity) {
            throw new Error(
                'An identity has to be supplied. This is an internal error.'
            );
        }

        const walletId = await pairWallet(ledger, dispatch);
        if (walletId !== identity.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
        }

        try {
            credentialNumber = await getNextCredentialNumber(identity.id);
        } catch (e) {
            throw new Error(`Unable to create account due to ${e}`);
            return;
        }

        const exportedKeys = await exportKeysFromLedger(
            identity,
            credentialNumber,
            setMessage,
            ledger
        );
        setKeys({ ...exportedKeys, credentialNumber });
    }

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string | JSX.Element) => void
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
        if (!keys) {
            throw new Error(
                'Missing Keys, which should have been exported already.'
            );
        }

        const credentialNumber = await getNextCredentialNumber(identity.id);
        const credential = await createCredentialInfo(
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
            address,
            credentialNumber,
            identityId: identity.id,
        };
        onChange(blob);
        onBlur();
        setMessage('Credential generated succesfully!');
        onSigned();
    }

    const showComparing = keys && !finishedComparing;

    return (
        <>
            {showComparing && (
                <Card
                    className={clsx(
                        generalStyles.card,
                        splitViewStyles.sign,
                        styles.root,
                        'textCenter flexColumn'
                    )}
                    header="Compare public key"
                >
                    <PublicKeyDetails publickey={keys?.publicKey || ''} />
                    <Button
                        className={styles.compareButton}
                        onClick={() => setFinishedComparing(true)}
                    >
                        Confirm
                    </Button>
                </Card>
            )}
            {!showComparing && (
                <SimpleLedger
                    className={clsx(
                        generalStyles.card,
                        splitViewStyles.sign,
                        styles.root
                    )}
                    ledgerCall={keys ? sign : exportKeys}
                />
            )}
        </>
    );
}
