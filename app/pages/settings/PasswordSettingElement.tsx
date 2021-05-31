import React, { useCallback, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { knex as externalKnex } from 'knex';
import Form from '~/components/Form/Form';
import Card from '~/cross-app-components/Card/Card';
import { invalidateKnexSingleton, knex, setPassword } from '~/database/knex';
import styles from './PasswordSettingElement.module.scss';
import config from '../../database/knexfile';

const environment = process.env.NODE_ENV;

interface Props {
    displayText: string;
}

interface PasswordInput {
    currentPassword: string;
    password: string;
    repassword: string;
}

type PasswordForm = PasswordInput;

export default function PasswordSettingElement({ displayText }: Props) {
    const [validationError, setValidationError] = useState<string>();
    const [success, setSuccess] = useState<string>();
    const [keyingDatabase, setKeyingDatabase] = useState(false);

    const handleSubmit: SubmitHandler<PasswordForm> = useCallback(
        async (values) => {
            setKeyingDatabase(true);

            if (values.password !== values.repassword) {
                setValidationError('Passwords do not match');
                setSuccess(undefined);
                setKeyingDatabase(false);
                return;
            }

            // Re-key the database with the new password.
            try {
                if (!environment) {
                    throw new Error('Unable to determine environment');
                }

                // Check that the current password input is correct. An error will be
                // thrown if it was incorrect. This requires a new knex configuration,
                // to use the key that was given as input here.
                const configuration = await config(
                    environment,
                    values.currentPassword
                );
                const db = externalKnex(configuration);
                await db.select().table('setting');

                // Re-key the database, update the password in memory and invalidate
                // the current knex singleton.
                await (await knex()).raw('PRAGMA rekey = ??', values.password);
                setPassword(values.password);
                invalidateKnexSingleton();
                setValidationError(undefined);
                setSuccess('Your password was successfully updated');
                setKeyingDatabase(false);
            } catch (error) {
                setKeyingDatabase(false);
                setSuccess(undefined);
                setValidationError('Invalid password');
            }
        },
        []
    );

    return (
        <Card className={styles.top}>
            <h3>{displayText}</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Input
                    type="password"
                    className={styles.password}
                    name="currentPassword"
                    placeholder="Enter current password"
                />
                <Form.Input
                    type="password"
                    className={styles.input}
                    name="password"
                    placeholder="Enter new password"
                />
                <Form.Input
                    type="password"
                    className={styles.input}
                    name="repassword"
                    placeholder="Re-enter new password"
                />
                <p className={styles.error}>{validationError}</p>
                <p className={styles.success}>{success}</p>
                <Form.Submit
                    className={styles.submit}
                    disabled={keyingDatabase}
                >
                    Change password
                </Form.Submit>
            </Form>
        </Card>
    );
}
