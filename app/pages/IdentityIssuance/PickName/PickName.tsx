import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { FormProvider, useForm } from 'react-hook-form';
import routes from '~/constants/routes.json';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import { EqualRecord } from '~/utils/types';

import styles from './PickName.module.scss';
import Button from '~/cross-app-components/Button';

interface IdentityIssuancePickNameFields {
    account: string;
    identity: string;
}

const fieldNames: EqualRecord<IdentityIssuancePickNameFields> = {
    account: 'account',
    identity: 'identity',
};

interface Props extends Partial<IdentityIssuancePickNameFields> {
    setIdentityName: (name: string) => void;
    setAccountName: (name: string) => void;
}

// TODO: add Validation to names
export default function IdentityIssuancePickName({
    setIdentityName,
    setAccountName,
    account,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const form = useForm<IdentityIssuancePickNameFields>({ mode: 'onTouched' });
    const { handleSubmit } = form;

    const submit = handleSubmit((fields: IdentityIssuancePickNameFields) => {
        setIdentityName(fields.identity);
        setAccountName(fields.account);
        dispatch(push(routes.IDENTITYISSUANCE_PICKPROVIDER));
    });

    return (
        <>
            <h2 className={styles.header}>
                The initial account and identity names
            </h2>
            <p className={styles.spanBoth}>
                The first step of creating a new identity is decide what to name
                it. Besides naming the identity, you must also pick a name for
                the initial account of the identity. After choosing your names,
                you can continue to select an identity provider.
            </p>
            <FormProvider {...form}>
                <Card className={styles.form} header="Identity summary">
                    <p className="mV30">
                        What would you like to name your identity?
                    </p>
                    <Form.Input
                        className={styles.field}
                        name={fieldNames.identity}
                        defaultValue={identity}
                        placeholder="Identity name"
                        rules={{ required: 'Please specify an identity name' }}
                    />
                    <p className="mT100 mB30">
                        What would you like to name your initial account?
                    </p>
                    <Form.Input
                        className={clsx(styles.field, 'mB20')}
                        name={fieldNames.account}
                        defaultValue={account}
                        placeholder="Initial account name"
                        rules={{
                            required: 'Please specify an initial account name',
                        }}
                    />
                </Card>
                <Button className={styles.button} onClick={submit}>
                    Continue
                </Button>
            </FormProvider>
        </>
    );
}
