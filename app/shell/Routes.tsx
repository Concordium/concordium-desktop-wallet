import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '../constants/routes.json';
import AddressBookPage from '../pages/AddressBook/AddressBookPage';
import DefaultPage from '~/pages/Home/DefaultPage';
import HomePage from '../pages/Home/HomePage';
import AccountPage from '../pages/Accounts/AccountPage';
import IdentityPage from '../pages/Identities/IdentityPage';
import IssuancePage from '../pages/IdentityIssuance/IdentityIssuancePage';
import AccountCreation from '../pages/AccountCreation/AccountCreationPage';
import MultiSignatureRouter from '../pages/multisig/MultiSignatureRouter';
import ExportImport from '../pages/exportImport/ExportImportPage';
import PerformImport from '../pages/exportImport/PerformImport';
import SubmitTransfer from '../pages/Accounts/SubmitTransfer';
import GenerateCredential from '../pages/GenerateCredential/GenerateCredentialPage';
import AccountReport from '~/pages/Accounts/AccountReport';
import genesisAccount from '../pages/GenesisAccount/GenesisAccount';
import SettingsRouter from '~/pages/settings/SettingsRouter';

export default function Routes(): JSX.Element {
    return (
        <Switch>
            <Route
                path={routes.CREATE_GENESIS_ACCOUNT}
                component={genesisAccount}
            />
            <Route path={routes.SUBMITTRANSFER} component={SubmitTransfer} />
            <Route path={routes.ACCOUNT_REPORT} component={AccountReport} />
            <Route path={routes.ACCOUNTCREATION} component={AccountCreation} />
            <Route path={routes.ACCOUNTS} component={AccountPage} />
            <Route path={routes.IDENTITYISSUANCE} component={IssuancePage} />
            <Route path={routes.IDENTITIES} component={IdentityPage} />
            <Route path={routes.IMPORT} component={PerformImport} />
            <Route path={routes.EXPORTIMPORT} component={ExportImport} />
            <Route
                path={routes.GENERATE_CREDENTIAL}
                component={GenerateCredential}
            />
            <Route
                path={routes.MULTISIGTRANSACTIONS}
                component={MultiSignatureRouter}
            />
            <Route path={routes.ADDRESSBOOK} component={AddressBookPage} />
            <Route path={routes.SETTINGS} component={SettingsRouter} />
            <Route path={routes.HOME} component={HomePage} />
            <Route path="/" component={DefaultPage} />
        </Switch>
    );
}
