import React, { useCallback, useEffect, useState } from 'react';
import fs from 'fs';
import { Route, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { SubmitHandler } from 'react-hook-form';
import routes from '../../constants/routes.json';
import { getDatabaseFilename } from '~/database/knexfile';
import PageLayout from '~/components/PageLayout/PageLayout';
import Button from '~/cross-app-components/Button';
import styles from './Home.module.scss';
import Form from '~/components/Form';
import { invalidateKnexSingleton, setPassword } from '../../database/knex';
import { loadAllSettings } from '~/database/SettingsDao';
import Card from '~/cross-app-components/Card';
import migrate from '~/database/migration';
import initApplication from '~/utils/initialize';

interface PasswordInput {
    password: string;
    repassword: string;
}

interface PasswordSingleInput {
    password: string;
}

type PasswordForm = PasswordInput;
type PasswordSingleForm = PasswordSingleInput;

/**
 * Checks whether the database has already been created or not.
 * We cannot just check whether the file exists, as the knex configuration
 * will have created an empty file, therefore the check actually checks
 * whether the file has a non-empty size.
 */
async function databaseExists(): Promise<boolean> {
    const databaseFilename = await getDatabaseFilename();
    if (!fs.existsSync(databaseFilename)) {
        return false;
    }
    const stats = fs.statSync(databaseFilename);
    return stats.size > 0;
}

export default function HomePage() {
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

    function NewUserInit() {
        return (
            <PageLayout.Container disableBack>
                <div className={styles.content}>
                    <div>
                        <div>
                            <h2 className={styles.title}>Hi, there!</h2>
                            <p>
                                Before you can start using the Concordium
                                Desktop Wallet, you have to set up a few
                                security measures. Press Continue to be guided
                                through the setup process.
                            </p>
                        </div>
                        <Button
                            onClick={() =>
                                dispatch(
                                    push({
                                        pathname: routes.HOME_SELECT_PASSWORD,
                                    })
                                )
                            }
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </PageLayout.Container>
        );
    }

    function SelectPassword() {
        return (
            <PageLayout.Container disableBack>
                <div className={styles.password}>
                    <h2>Select a wallet password</h2>
                    <p>
                        The first step is to set up a password for the wallet.
                        This password will be used when you open the
                        application. It is very important that you do not lose
                        this password, as it cannot be retrieved if lost.
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

    function PasswordHasBeenSet() {
        return (
            <PageLayout.Container disableBack>
                <div className={styles.content}>
                    <div>
                        <h2 className={styles.title}>
                            Wallet password created!
                        </h2>
                        <p>
                            Your wallet password has been set! Please remember
                            to keep it safe, as you will need it later if you
                            want to reset it. Lost passwords cannot be recreated
                            or reset.
                        </p>
                    </div>
                    <Button
                        onClick={() =>
                            dispatch(push({ pathname: routes.ACCOUNTS }))
                        }
                    >
                        Continue to the application
                    </Button>
                </div>
            </PageLayout.Container>
        );
    }

    function EnterWalletPassword() {
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

    useEffect(() => {
        databaseExists()
            .then(async (exists) => {
                // Determine which page to show, based on whether we have database
                // access or not.
                if (!exists) {
                    dispatch(push({ pathname: routes.HOME_NEW_USER }));
                } else {
                    try {
                        await loadAllSettings();
                    } catch (error) {
                        // Either an invalid password has been set, or not password has been set
                        // yet, so let the user input a password.
                        dispatch(
                            push({ pathname: routes.HOME_ENTER_PASSWORD })
                        );
                        return exists;
                    }
                    // A valid password is in memory, so go to base page.
                    dispatch(push({ pathname: routes.HOME }));
                }
                return exists;
            })
            .catch(() => {
                dispatch(push({ pathname: routes.HOME }));
            });
    }, [dispatch]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Concordium</h1>
            </PageLayout.Header>
            <Switch>
                <Route
                    path={routes.HOME_ENTER_PASSWORD}
                    render={() => <EnterWalletPassword />}
                />
                <Route
                    path={routes.HOME_PASSWORD_SET}
                    render={() => <PasswordHasBeenSet />}
                />
                <Route
                    path={routes.HOME_SELECT_PASSWORD}
                    render={() => <SelectPassword />}
                />
                <Route
                    path={routes.HOME_NEW_USER}
                    render={() => <NewUserInit />}
                />
                <Route
                    path={routes.HOME}
                    render={() => {
                        return null;
                    }}
                />
            </Switch>
        </PageLayout>
    );
}
