import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import clsx from 'clsx';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';
import { commonAddressValidators } from '~/utils/accountHelpers';
import { ClassName } from '~/utils/types';
import Label from '~/components/Label';
import Card from '~/cross-app-components/Card';
import generateCredentialContext from '../GenerateCredentialContext';

import styles from './AccountCredentialSummary.module.scss';

interface Props extends ClassName {
    Button?: () => JSX.Element | null;
    accountValidationError?: string;
}

const addressForm = 'address';

export default function AccountCredentialSummary({
    Button = () => null,
    accountValidationError,
    className,
}: Props) {
    const location = useLocation().pathname;
    const {
        address: [address, setAddress],
        identity: [identity],
        credential: [credentialBlob],
    } = useContext(generateCredentialContext);

    const form = useForm({ mode: 'onTouched' });
    const { watch, setError } = form;
    const addressWatcher = watch(addressForm);

    useEffect(() => {
        if (accountValidationError) {
            setError(addressForm, {
                type: 'manual',
                message: accountValidationError,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountValidationError]);

    useEffect(() => {
        if (location === routes.GENERATE_CREDENTIAL_PICKACCOUNT) {
            setAddress(addressWatcher);
        }
    }, [setAddress, addressWatcher, location]);

    return (
        <Card
            className={clsx(styles.root, className)}
            header="Account Credential Summary"
        >
            <Label className="mT30">Identity:</Label>
            {identity ? (
                <h2 className={styles.value}>{identity.name}</h2>
            ) : (
                <h2 className={styles.blueText}>Choose an ID on the right</h2>
            )}
            <Label>Account:</Label>
            {location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                <FormProvider {...form}>
                    <Form.TextArea
                        className={clsx('body1', styles.value)}
                        defaultValue={address}
                        name={addressForm}
                        placeholder="Paste the account address here"
                        rules={{
                            required: 'Please enter address',
                            ...commonAddressValidators,
                            validate: {
                                accountValidation: () => accountValidationError,
                            },
                        }}
                    />
                </FormProvider>
            ) : (
                <h2 className={styles.value}>
                    {' '}
                    {address || 'To be determined'}{' '}
                </h2>
            )}
            <Label>Identicon:</Label>
            {credentialBlob?.credential ? (
                <Identicon data={JSON.stringify(credentialBlob?.credential)} />
            ) : (
                <h2 className={styles.value}>To be generated</h2>
            )}
            <Button />
        </Card>
    );
}
