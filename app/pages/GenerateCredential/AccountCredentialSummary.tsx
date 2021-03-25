import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { List } from 'semantic-ui-react';
import { Validate, FormProvider, useForm } from 'react-hook-form';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { Identity, CredentialDeploymentInformation } from '~/utils/types';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';
import { isValidAddress } from '~/utils/accountHelpers';
import styles from './GenerateCredential.module.scss';

interface Props {
    identity: Identity | undefined;
    address: string;
    setAddress: (address: string) => void;
    credential: CredentialDeploymentInformation | undefined;
    Button?: () => JSX.Element | null;
    isReady: boolean;
}

const mustBeDeployedMessage = 'Address must belong to an deployed account';

export default function AccountCredentialSummary({
    isReady,
    identity,
    address,
    setAddress,
    credential,
    Button = () => null,
}: Props) {
    const location = useLocation().pathname;
    const form = useForm({ mode: 'onTouched' });
    const { watch, setError, clearErrors } = form;
    const addressWatcher = watch('address');

    const validate: Validate = (newAddress: string) => {
        if (!isValidAddress(newAddress)) {
            return 'Address format is invalid';
        }
        if (!isReady) {
            return mustBeDeployedMessage;
        }
        return true;
    };

    useEffect(() => {
        if (address && !isReady) {
            setError('address', {
                type: 'manual',
                message: mustBeDeployedMessage,
            });
        }
        if (isReady) {
            clearErrors();
        }
    }, [setError, isReady]);

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
                        name="address"
                        placeholder="Paste the account address here"
                        rules={{
                            required: 'Address required',
                            minLength: {
                                value: 50,
                                message: 'Address should be 50 characters',
                            },
                            maxLength: {
                                value: 50,
                                message: 'Address should be 50 characters',
                            },
                            validate: {
                                validate,
                            },
                        }}
                        autoScale
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
