/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import TestPage from './containers/TestPage';
import AccountsPage from './containers/AccountsPage';
import TodoPage from './containers/TodoPage';
import IdentityPage from './containers/IdentityPage';
import AddressBookPage from './containers/AddressBookPage';
import styles from './Main.css';
import SettingsPage from './containers/SettingsPage';
import MultiSignaturePage from './containers/MultiSignaturePage';
import MultiSignatureProposalPageRouter from './containers/MultiSignatureProposalPageRouter';
import ProposalView from './components/multisig/ProposalView';
import SignTransactionView from './components/multisig/SignTransactionView';

export default function Routes() {
    return (
        <App>
            <div className={styles.mainWindow}>
                <Switch>
                    <Route path={routes.TEST} component={TestPage} />
                    <Route path={routes.ACCOUNTS} component={AccountsPage} />
                    <Route path={routes.IDENTITIES} component={IdentityPage} />
                    <Route
                        path={routes.ADDRESSBOOK}
                        component={AddressBookPage}
                    />
                    <Route path={routes.EXPORTIMPORT} component={TodoPage} />
                    <Route path={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION} component={SignTransactionView} />
                    <Route path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING} component={ProposalView} />
                    <Route path={routes.MULTISIGTRANSACTIONS_PROPOSAL} component={MultiSignatureProposalPageRouter} />
                    <Route
                        path={routes.MULTISIGTRANSACTIONS}
                        component={MultiSignaturePage}
                    />
                    <Route path={routes.SETTINGS} component={SettingsPage} />
                    <Route path={routes.HOME} component={HomePage} />
                </Switch>
            </div>
        </App>
    );
}
