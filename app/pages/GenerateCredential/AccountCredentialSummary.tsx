import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { List } from 'semantic-ui-react';
import { FormProvider, useForm } from 'react-hook-form';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { Identity, CredentialDeploymentInformation } from '~/utils/types';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';
import { commonAddressValidators } from '~/utils/accountHelpers';
import styles from './GenerateCredential.module.scss';

interface Props {
    identity: Identity | undefined;
    address: string;
    setAddress: (address: string) => void;
    credential: CredentialDeploymentInformation | undefined;
    Button?: () => JSX.Element | null;
    accountValidationError?: string;
}

const addressForm = 'address';

export default function AccountCredentialSummary({
    identity,
    address,
    setAddress,
    credential,
    Button = () => null,
    accountValidationError,
}: Props) {
    const location = useLocation().pathname;
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
        <div className={styles.accountCredentialSummary}>
            <h2>Account Credential Summary</h2>
            <b>Identity:</b>
            {identity ? (
                <h2>{identity.name}</h2>
            ) : (
                <h2 className={styles.blueText}>Choose an ID on the right</h2>
            )}
            <List.Item>Account:</List.Item>
            {location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                <FormProvider {...form}>
                    <Form.TextArea
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
                <h2> {address || 'To be determined'} </h2>
            )}
            <b>Identicon:</b>
            {credential ? (
                <Identicon data={JSON.stringify(credential)} />
            ) : (
                <h2>To be generated</h2>
            )}
            <Button />
        </div>
    );
}
