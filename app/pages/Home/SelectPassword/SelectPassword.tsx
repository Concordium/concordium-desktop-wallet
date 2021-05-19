import { push } from 'connected-react-router';
import React, { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Form from '~/components/Form/Form';
import PageLayout from '~/components/PageLayout/PageLayout';
import { setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import initApplication from '~/utils/initialize';
import routes from '../../../constants/routes.json';
import styles from './SelectPassword.module.scss';

interface PasswordInput {
    password: string;
    repassword: string;
}
type PasswordForm = PasswordInput;

export default function SelectPassword() {
    const dispatch = useDispatch();

    const handleSubmit: SubmitHandler<PasswordForm> = useCallback(
        async (values) => {
            setPassword(values.password);
            await migrate();
            await initApplication(dispatch);
            dispatch(push({ pathname: routes.HOME_PASSWORD_SET }));
        },
        [dispatch]
    );

    return (
        <PageLayout.Container className="pB0" disableBack padding="both">
            <div className={styles.container}>
                <h2>Select a wallet password</h2>
                <p>
                    The first step is to set up a password for the wallet. This
                    password will be used when you open the application. It is
                    very important that you do not lose this password, as it
                    cannot be retrieved if lost.
                </p>
                <Form
                    className="flexChildFill flexColumn justifySpaceBetween"
                    onSubmit={handleSubmit}
                >
                    <div className={styles.fields}>
                        <Form.Input
                            type="password"
                            className={styles.field}
                            name="password"
                            rules={{ required: 'Password is required' }}
                            placeholder="Enter password"
                        />
                        <Form.Input
                            type="password"
                            className={styles.field}
                            name="repassword"
                            rules={{
                                required:
                                    'Re-entering your password is required',
                                validate: undefined, // TODO: add is equal validation.
                            }}
                            placeholder="Re-enter password"
                        />
                    </div>
                    <Form.Submit className={styles.button}>
                        Continue
                    </Form.Submit>
                </Form>
            </div>
        </PageLayout.Container>
    );
}
