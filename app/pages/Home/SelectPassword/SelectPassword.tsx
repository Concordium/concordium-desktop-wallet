import { push } from 'connected-react-router';
import React, { useCallback, useEffect } from 'react';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Form from '~/components/Form';
import PageLayout from '~/components/PageLayout';
import { setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import initApplication from '~/utils/initialize';
import { passwordValidators } from '~/utils/passwordHelpers';
import routes from '~/constants/routes.json';

import homeStyles from '../Home.module.scss';
import styles from './SelectPassword.module.scss';

interface PasswordInput {
    password: string;
    repassword: string;
}
type PasswordForm = PasswordInput;

export default function SelectPassword() {
    const dispatch = useDispatch();
    const form = useForm<PasswordForm>({ mode: 'onTouched' });
    const { password } = form.watch(['password']);

    const handleSubmit: SubmitHandler<PasswordForm> = useCallback(
        async (values) => {
            setPassword(values.password);
            await migrate();
            await initApplication(dispatch);
            dispatch(push({ pathname: routes.HOME_PASSWORD_SET }));
        },
        [dispatch]
    );

    const passwordsAreEqual: Validate = useCallback(
        (value: string) => value === password || 'Passwords are not equal',
        [password]
    );

    useEffect(() => {
        if (form.formState.dirtyFields.repassword) {
            form.trigger('repassword');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [password]);

    return (
        <PageLayout.Container className="pB0" disableBack padding="both">
            <div className={homeStyles.content}>
                <h2>Select a wallet password</h2>
                <p>
                    The first step is to set up a password for the wallet. This
                    password will be used when you open the application. It is
                    very important that you do not lose this password, as it
                    cannot be retrieved if lost.
                </p>
                <Form
                    formMethods={form}
                    className="flexChildFill flexColumn justifySpaceBetween"
                    onSubmit={handleSubmit}
                >
                    <div className={styles.fields}>
                        <Form.Input
                            type="password"
                            className={styles.field}
                            name="password"
                            rules={passwordValidators}
                            placeholder="Enter password"
                        />
                        <Form.Input
                            type="password"
                            className={styles.field}
                            name="repassword"
                            rules={{
                                required:
                                    'Re-entering your password is required',
                                validate: passwordsAreEqual,
                            }}
                            placeholder="Re-enter password"
                        />
                    </div>
                    <Form.Submit className={homeStyles.button}>
                        Continue
                    </Form.Submit>
                </Form>
            </div>
        </PageLayout.Container>
    );
}
