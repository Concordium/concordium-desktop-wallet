import React, { useEffect } from 'react';
import fs from 'fs';
import { Route, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';
import { getDatabaseFilename } from '~/database/knexfile';
import PageLayout from '~/components/PageLayout';
import { loadAllSettings } from '~/database/SettingsDao';
import NewUserInit from './NewUserInit';
import PasswordHasBeenSet from './PasswordHasBeenSet';
import SelectPassword from './SelectPassword';
import Unlock from './Unlock';

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
                        // Either an invalid password has been set, or no password has been set
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
                    render={() => <Unlock />}
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
