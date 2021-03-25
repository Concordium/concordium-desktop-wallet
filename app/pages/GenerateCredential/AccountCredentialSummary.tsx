import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List } from 'semantic-ui-react';
import { Validate, FormProvider, useForm } from 'react-hook-form';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { Identity, CredentialDeploymentInformation } from '~/utils/types';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';
import { isValidAddress } from '~/utils/accountHelpers';

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
        <Card>
            <Card.Header>Account Credential Summary</Card.Header>
            <Card.Content textAlign="center">
                <List>
                    <List.Item>Identity:</List.Item>
                    <List.Item>
                        <b>
                            {identity
                                ? identity.name
                                : 'Choose an ID on the right'}
                        </b>
                    </List.Item>
                    <List.Item>Account:</List.Item>
                    <List.Item>
                        {location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                            <FormProvider {...form}>
                                <Form.TextArea
                                    name="address"
                                    placeholder="Paste the account address here"
                                    rules={{
                                        required: 'Address required',
                                        minLength: {
                                            value: 50,
                                            message:
                                                'Address should be 50 characters',
                                        },
                                        maxLength: {
                                            value: 50,
                                            message:
                                                'Address should be 50 characters',
                                        },
                                        validate: {
                                            validate,
                                        },
                                    }}
                                    autoScale
                                />
                            </FormProvider>
                        ) : (
                            <b> {address || 'To be determined'} </b>
                        )}
                    </List.Item>
                    <List.Item>Identicon:</List.Item>
                    <List.Item>
                        {credential ? (
                            <Identicon data={JSON.stringify(credential)} />
                        ) : (
                            <b>To be generated</b>
                        )}
                    </List.Item>
                </List>
                <Button />
            </Card.Content>
        </Card>
    );
}
