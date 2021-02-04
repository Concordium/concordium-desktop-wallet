/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './shell/App';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import AccountPage from './pages/Accounts/AccountPage';
import TodoPage from './pages/TodoPage';
import IdentityPage from './pages/Identities/IdentityPage';
import AddressBookPage from './pages/AddressBook/AddressBookPage';
import IssuancePage from './pages/IdentityIssuance/IssuancePage';
import AccountCreation from './pages/AccountCreation/AccountCreationPage';
import SettingsPage from './pages/settings/SettingsPage';
import MultiSignaturePage from './pages/multisig/MultiSignaturePage';
import ProposalView from './pages/multisig/ProposalView';
import SignTransactionView from './pages/multisig/SignTransactionView';
import ExportSignedTransactionView from './pages/multisig/ExportSignedTransactionView';
import MultiSignatureCreateProposalView from './pages/multisig/MultiSignatureCreateProposalView';
import SubmittedProposalView from './pages/multisig/SubmittedProposalView';

export default function Routes() {
    return (
        <App>
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
                <Route path={routes.ADDRESSBOOK} component={AddressBookPage} />
                <Route path={routes.EXPORTIMPORT} component={TodoPage} />
                <Route
                    path={routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION}
                    component={SubmittedProposalView}
                />
                <Route
                    path={routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION}
                    component={ExportSignedTransactionView}
                />
                <Route
                    path={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION}
                    component={SignTransactionView}
                />
                <Route
                    path={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING}
                    component={ProposalView}
                />
                <Route
                    path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                    component={MultiSignatureCreateProposalView}
                />
                <Route
                    path={routes.MULTISIGTRANSACTIONS}
                    component={MultiSignaturePage}
                />
                <Route path={routes.SETTINGS} component={SettingsPage} />
                <Route path={routes.HOME} component={HomePage} />
            </Switch>
        </App>
    );
}
