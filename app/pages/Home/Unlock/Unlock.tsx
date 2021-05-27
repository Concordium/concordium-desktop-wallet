import { push } from 'connected-react-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FieldValues, useForm } from 'react-hook-form';
import Card from '~/cross-app-components/Card';
import { invalidateKnexSingleton, setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import { loadAllSettings } from '~/database/SettingsDao';
import initApplication from '~/utils/initialize';
import routes from '~/constants/routes.json';
import Form from '~/components/Form';
import { useUpdateEffect } from '~/utils/hooks';

import styles from './Unlock.module.scss';

interface UnlockForm extends FieldValues {
    password: string;
}

export default function Unlock() {
    const dispatch = useDispatch();
    const form = useForm<UnlockForm>({ mode: 'onTouched' });
    const { password: pwField } = form.watch();
    const [validationError, setValidationError] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (validationError) {
            setValidationError(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pwField]);

    useUpdateEffect(() => {
        if (!validationError) {
            form.trigger();
        }
    }, [validationError]);

    const unlock = useCallback(
        async ({ password }: UnlockForm) => {
            setPassword(password);
            invalidateKnexSingleton();

            try {
                await loadAllSettings();
                await migrate();
                await initApplication(dispatch);
                dispatch(push({ pathname: routes.ACCOUNTS }));
            } catch (error) {
                // The password was incorrect.
                setValidationError('Invalid password');
                form.trigger();
            }
        },
        [dispatch, form]
    );

    return (
        <Form<UnlockForm> onSubmit={unlock} formMethods={form}>
            <Card className={styles.card}>
                <h3>Enter wallet password</h3>
                <Form.Input
                    className="body2"
                    name="password"
                    type="password"
                    rules={{
                        required: 'Please enter your wallet password',
                        validate: () => validationError,
                    }}
                    autoFocus
                />
                <Form.Submit>Unlock</Form.Submit>
            </Card>
        </Form>
    );
}
