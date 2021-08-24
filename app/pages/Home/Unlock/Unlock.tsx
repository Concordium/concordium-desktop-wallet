import { push } from 'connected-react-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FieldValues, useForm } from 'react-hook-form';
import Card from '~/cross-app-components/Card';
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
    const form = useForm<UnlockForm>({ mode: 'onSubmit' });
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
            window.database.general.setPassword(password);
            window.database.general.invalidateKnexSingleton();
            const dbMigrated = await window.database.general.migrate();
            if (dbMigrated) {
                await initApplication(dispatch);
                dispatch(push({ pathname: routes.ACCOUNTS }));
            } else {
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
