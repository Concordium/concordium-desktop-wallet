import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';
import PageLayout from '~/components/PageLayout';
import { loadAllSettings } from '~/database/SettingsDao';
import SelectPassword from './SelectPassword';
import NewUserInit from './NewUserInit';
import PasswordHasBeenSet from './PasswordHasBeenSet';
import Unlock from './Unlock';
import databaseExists from './util';

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
                        // TODO Refine this, as it throws an error in the handler in the main thread. So we should make
                        // a method specifically for testing this instead of trying to select all.
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
