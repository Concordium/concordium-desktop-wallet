import { push } from 'connected-react-router';
import React, { useCallback, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Form from '~/components/Form/Form';
import Card from '~/cross-app-components/Card/Card';
import { invalidateKnexSingleton, setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import { loadAllSettings } from '~/database/SettingsDao';
import initApplication from '~/utils/initialize';
import routes from '../../constants/routes.json';
import styles from './Home.module.scss';

interface PasswordSingleInput {
    password: string;
}
type PasswordSingleForm = PasswordSingleInput;

export default function EnterWalletPassword() {
    const dispatch = useDispatch();
    const [validationError, setValidationError] = useState<string>();

    const handleUnlock: SubmitHandler<PasswordSingleForm> = useCallback(
        async (values) => {
            setPassword(values.password);
            invalidateKnexSingleton();
            try {
                await loadAllSettings();
                await migrate();
                await initApplication(dispatch);
                dispatch(push({ pathname: routes.ACCOUNTS }));
            } catch (error) {
                // The password was incorrect.
                setValidationError('Invalid password');
            }
        },
        [dispatch]
    );

    return (
        <Card className={styles.card}>
            <Form className={styles.enter} onSubmit={handleUnlock}>
                <h3>Enter wallet password</h3>
                <div>
                    <Form.Input
                        className={styles.input}
                        name="password"
                        placeholder="Enter your wallet password"
                        type="password"
                    />
                    <p className={styles.error}>{validationError}</p>
                </div>
                <Form.Submit>Unlock</Form.Submit>
            </Form>
        </Card>
    );
}
