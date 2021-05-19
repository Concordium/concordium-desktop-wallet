import { push } from 'connected-react-router';
import React, { useCallback, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Form from '~/components/Form/Form';
import PageLayout from '~/components/PageLayout/PageLayout';
import { setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import initApplication from '~/utils/initialize';
import routes from '../../constants/routes.json';
import styles from './Home.module.scss';

interface PasswordInput {
    password: string;
    repassword: string;
}
type PasswordForm = PasswordInput;

export default function SelectPassword() {
    const dispatch = useDispatch();
    const [validationError, setValidationError] = useState<string>();

    const handleSubmit: SubmitHandler<PasswordForm> = useCallback(
        async (values) => {
            if (values.password !== values.repassword) {
                setValidationError('The two passwords must be equal');
                return;
            }

            setPassword(values.password);
            await migrate();
            await initApplication(dispatch);
            dispatch(push({ pathname: routes.HOME_PASSWORD_SET }));
        },
        [dispatch]
    );

    return (
        <PageLayout.Container disableBack>
            <div className={styles.card}>
                <h2>Select a wallet password</h2>
                <p>
                    The first step is to set up a password for the wallet. This
                    password will be used when you open the application. It is
                    very important that you do not lose this password, as it
                    cannot be retrieved if lost.
                </p>
                <Form className={styles.enter} onSubmit={handleSubmit}>
                    <div>
                        <Form.Input
                            type="password"
                            className={styles.input}
                            name="password"
                            rules={{ required: 'Password is required' }}
                            placeholder="Enter password"
                        />
                        <Form.Input
                            type="password"
                            className={styles.input}
                            name="repassword"
                            rules={{
                                required:
                                    'Re-entering your password is required',
                            }}
                            placeholder="Re-enter password"
                        />
                        <p className={styles.error}>{validationError}</p>
                    </div>
                    <Form.Submit>Continue</Form.Submit>
                </Form>
            </div>
        </PageLayout.Container>
    );
}
