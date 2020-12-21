/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import TestPage from './containers/TestPage';
import AccountPage from './containers/AccountPage';
import TodoPage from './containers/TodoPage';
import IdentityPage from './containers/IdentityPage';
import AddressBookPage from './containers/AddressBookPage';
import IssuancePage from './containers/IssuancePage';
import AccountCreation from './containers/AccountCreationPage';
import styles from './Main.css';

export default function Routes() {
    return (
        <App>
            <div className={styles.mainWindow}>
                <Switch>
                    <Route path={routes.TEST} component={TestPage} />
                    <Route path={routes.ACCOUNTS} component={AccountPage} />
                    <Route
                        path={routes.IDENTITYISSUANCE}
                        component={IssuancePage}
                    />
                    <Route
                        path={routes.ACCOUNTCREATION}
                        component={AccountCreation}
                    />
                    <Route path={routes.IDENTITIES} component={IdentityPage} />
                    <Route
                        path={routes.ADDRESSBOOK}
                        component={AddressBookPage}
                    />
                    <Route path={routes.EXPORTIMPORT} component={TodoPage} />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS}
                        component={TodoPage}
                    />
                    <Route path={routes.SETTINGS} component={TodoPage} />
                    <Route path={routes.HOME} component={HomePage} />
                </Switch>
            </div>
        </App>
    );
}
