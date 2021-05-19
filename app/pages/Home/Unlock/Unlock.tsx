import { push } from 'connected-react-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Card from '~/cross-app-components/Card';
import { invalidateKnexSingleton, setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import { loadAllSettings } from '~/database/SettingsDao';
import initApplication from '~/utils/initialize';
import routes from '~/constants/routes.json';
import styles from './Unlock.module.scss';
import Input from '~/components/Form/Input';
import ErrorMessage from '~/components/Form/ErrorMessage';
import Button from '~/cross-app-components/Button';

export default function Unlock() {
    const dispatch = useDispatch();
    const [pw, setPw] = useState<string | undefined>();
    const [validationError, setValidationError] = useState<
        string | undefined
    >();

    useEffect(() => {
        setValidationError(undefined);
    }, [pw]);

    const unlock = useCallback(async () => {
        if (!pw) {
            setValidationError('Please enter your wallet password');
            return;
        }

        setPassword(pw);
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
    }, [pw, dispatch]);

    return (
        <Card className={styles.card}>
            <h3>Enter wallet password</h3>
            <div>
                <Input
                    className="body2"
                    name="password"
                    placeholder="Enter your wallet password"
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                />
                <ErrorMessage>{validationError}</ErrorMessage>
            </div>
            <Button onClick={unlock}>Unlock</Button>
        </Card>
    );
}
