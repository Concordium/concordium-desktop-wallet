import React, { useCallback, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Form from '~/components/Form/Form';
import Card from '~/cross-app-components/Card/Card';
import { passwordValidators } from '~/utils/passwordHelpers';
import styles from './PasswordSettingElement.module.scss';

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
            const rekeyed = await window.database.general.rekeyDatabase(
                values.currentPassword,
                values.password
            );
            if (rekeyed) {
                await window.database.general.setPassword(values.password);
                await window.database.general.invalidateKnexSingleton();
                setValidationError(undefined);
                setSuccess('Your password was successfully updated');
                setKeyingDatabase(false);
            } else {
                setKeyingDatabase(false);
                setSuccess(undefined);
                setValidationError('Invalid password');
            }
        },
        []
    );

    return (
        <Card className={styles.top}>
            <h3 className="mB0">{displayText}</h3>
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
                    rules={passwordValidators}
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
