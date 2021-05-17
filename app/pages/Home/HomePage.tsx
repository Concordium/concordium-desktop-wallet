import React, { useCallback, useEffect } from 'react';
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
import WebpackMigrationSource from '~/database/WebpackMigrationSource';
import {
    invalidateKnexSingleton,
    isPasswordSet,
    knex,
    setPassword,
} from '../../database/knex';
import { loadAllSettings } from '~/database/SettingsDao';
import { findSetting, updateSettings } from '~/features/SettingsSlice';
import settingKeys from '../../constants/settingKeys.json';
import startClient from '~/utils/nodeConnector';
import { loadAccounts } from '~/features/AccountSlice';
import { loadAddressBook } from '~/features/AddressBookSlice';
import { loadCredentials } from '~/features/CredentialSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import { loadProposals } from '~/features/MultiSignatureSlice';
import listenForIdentityStatus from '~/utils/IdentityStatusPoller';
import { Dispatch } from '../../utils/types';
import Card from '~/cross-app-components/Card';

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
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore(dispatch: Dispatch) {
    const settings = await loadAllSettings();
    const nodeLocationSetting = findSetting(settingKeys.nodeLocation, settings);
    if (nodeLocationSetting) {
        const { address, port } = JSON.parse(nodeLocationSetting.value);
        startClient(dispatch, address, port);
    } else {
        throw new Error('Unable to find node location setting.');
    }
    return dispatch(updateSettings(settings));
}

async function onLoad(dispatch: Dispatch) {
    await loadSettingsIntoStore(dispatch);

    loadAddressBook(dispatch);
    loadAccounts(dispatch);
    loadIdentities(dispatch);
    loadProposals(dispatch);
    loadCredentials(dispatch);

    listenForIdentityStatus(dispatch);
}

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

    /**
     * Runs the knex migrations for the embedded sqlite database.
     */
    const migrate = useCallback(async () => {
        const config = {
            migrationSource: new WebpackMigrationSource(
                require.context('../../database/migrations', false, /.ts$/)
            ),
        };

        try {
            await (await knex()).migrate.latest(config);
        } catch (error) {
            process.nextTick(() => {
                process.exit(0);
            });
        }
        // Load all the required data into the application.
        await onLoad(dispatch);
    }, [dispatch]);

    const handleSubmit: SubmitHandler<PasswordForm> = useCallback(
        async (values) => {
            setPassword(values.password);
            await migrate();
            dispatch(push({ pathname: routes.HOME_PASSWORD_SET }));
        },
        [migrate, dispatch]
    );

    const handleUnlock: SubmitHandler<PasswordSingleForm> = useCallback(
        async (values) => {
            setPassword(values.password);
            invalidateKnexSingleton();
            try {
                await loadAllSettings();
                await migrate();
                dispatch(push({ pathname: routes.ACCOUNTS }));
            } catch (error) {
                // The password was incorrect.
                // TODO Tell the user that the password was incorrect.
            }
        },
        [migrate, dispatch]
    );

    function NewUserInit() {
        return (
            <PageLayout.Container disableBack>
                <div className={styles.content}>
                    <div className={styles.relative}>
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

    // TODO Add validation that the repassword === password.
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
                    <Form.Input
                        className={styles.input}
                        name="password"
                        placeholder="Enter your wallet password"
                        type="password"
                    />
                    <Form.Submit>Unlock</Form.Submit>
                </Form>
            </Card>
        );
    }

    useEffect(() => {
        if (isPasswordSet()) {
            dispatch(push({ pathname: routes.HOME }));
            return;
        }

        databaseExists()
            .then((exists) => {
                if (!exists) {
                    dispatch(push({ pathname: routes.HOME_NEW_USER }));
                } else {
                    dispatch(push({ pathname: routes.HOME_ENTER_PASSWORD }));
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
