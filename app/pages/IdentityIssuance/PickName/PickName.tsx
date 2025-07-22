import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import routes from '~/constants/routes.json';
import Form from '~/components/Form';
import { EqualRecord } from '~/utils/types';
import Button from '~/cross-app-components/Button';

import generalStyles from '../IdentityIssuance.module.scss';
import styles from './PickName.module.scss';
import { IDENTITY_NAME_MAX_LENGTH } from '~/utils/identityHelpers';

interface IdentityIssuancePickNameFields {
    identity: string;
}

const fieldNames: EqualRecord<IdentityIssuancePickNameFields> = {
    identity: 'identity',
};

interface Props extends Partial<IdentityIssuancePickNameFields> {
    setIdentityName: (name: string) => void;
}

// TODO: add Validation to names
export default function IdentityIssuancePickName({
    setIdentityName,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const form = useForm<IdentityIssuancePickNameFields>({ mode: 'onTouched' });
    const { handleSubmit } = form;

    const submit = handleSubmit((fields: IdentityIssuancePickNameFields) => {
        setIdentityName(fields.identity);
        // setAccountName(fields.account);
        dispatch(push(routes.IDENTITYISSUANCE_PICKPROVIDER));
    });

    return (
        <>
            <h2 className={generalStyles.header}>The initial identity names</h2>
            <p className={generalStyles.textRow}>
                The first step of creating a new identity is decide what to name
                it. After choosing name, you can continue to select an identity
                provider.
            </p>
            <FormProvider {...form}>
                <div className={generalStyles.spanBoth}>
                    <p className="mV30">
                        What would you like to name your identity?
                    </p>
                    <Form.Input
                        className={styles.field}
                        name={fieldNames.identity}
                        defaultValue={identity}
                        placeholder="Identity name"
                        rules={{
                            required: 'Please specify an identity name',
                            maxLength: {
                                value: IDENTITY_NAME_MAX_LENGTH,
                                message: `Cannot exceed ${IDENTITY_NAME_MAX_LENGTH} characters`,
                            },
                        }}
                    />
                </div>
                <Button className={generalStyles.singleButton} onClick={submit}>
                    Continue
                </Button>
            </FormProvider>
        </>
    );
}
