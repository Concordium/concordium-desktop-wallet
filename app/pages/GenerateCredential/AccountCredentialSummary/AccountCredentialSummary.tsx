import React, { useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useFormContext, Validate } from 'react-hook-form';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';
import {
    ACCOUNT_NAME_MAX_LENGTH,
    commonAddressValidators,
} from '~/utils/accountHelpers';
import { ClassName } from '~/utils/types';
import Label from '~/components/Label';
import Card from '~/cross-app-components/Card';
import styles from './AccountCredentialSummary.module.scss';
import { fieldNames } from '../types';
import savedStateContext from '../savedStateContext';
import { hasExistingCredential } from '~/database/CredentialDao';

interface Props extends ClassName {
    Button?: () => JSX.Element | null;
}

const errorMessage =
    'We already have a credential on this account with the current device';

export default function AccountCredentialSummary({
    Button = () => null,
    className,
}: Props) {
    const location = useLocation().pathname;
    const { watch } = useFormContext();
    const {
        identity: savedIdentity,
        address,
        accountName,
        credential: savedCredential,
    } = useContext(savedStateContext);
    const { credential = savedCredential, identity = savedIdentity } = watch([
        fieldNames.identity,
        fieldNames.credential,
    ]);

    const validateNoDuplicate: Validate = useCallback(
        async (currentAddress: string) => {
            try {
                const existing = await hasExistingCredential(
                    currentAddress,
                    identity.walletId
                );
                return !existing || errorMessage;
            } catch {
                return errorMessage;
            }
        },
        [identity]
    );

    return (
        <Card
            className={clsx(styles.root, className)}
            header="Account credential summary"
        >
            <Label className="mT30">Identity:</Label>
            {identity ? (
                <h2 className={styles.value}>{identity.name}</h2>
            ) : (
                <h2 className={styles.blueText}>Choose an ID on the right</h2>
            )}
            <Label>Account:</Label>
            {identity && location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                <Form.TextArea
                    className={clsx('body1', styles.value)}
                    defaultValue={address}
                    name={fieldNames.address}
                    spellCheck="false"
                    placeholder="Paste the account address here"
                    rules={{
                        required: 'Please enter address',
                        ...commonAddressValidators,
                        validate: {
                            ...commonAddressValidators.validate,
                            validateNoDuplicate,
                        },
                    }}
                />
            ) : (
                <h2 className={styles.value}>
                    {' '}
                    {address || 'To be determined'}{' '}
                </h2>
            )}
            <Label>Account name:</Label>
            {identity && location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                <Form.Input
                    className={clsx('body1', styles.value)}
                    defaultValue={accountName}
                    name={fieldNames.accountName}
                    placeholder="Name of account"
                    rules={{
                        required: 'Please enter account name',
                        maxLength: {
                            value: ACCOUNT_NAME_MAX_LENGTH,
                            message: `Cannot exceed ${ACCOUNT_NAME_MAX_LENGTH} characters`,
                        },
                    }}
                />
            ) : (
                <h2 className={styles.value}>
                    {' '}
                    {accountName || 'To be determined'}{' '}
                </h2>
            )}

            {credential?.credential ? (
                <Identicon data={JSON.stringify(credential?.credential)} />
            ) : (
                <>
                    <Label>Identicon:</Label>
                    <h2 className={styles.value}>To be generated</h2>
                </>
            )}
            <Button />
        </Card>
    );
}
