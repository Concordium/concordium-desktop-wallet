import React from 'react';
import { Route, Switch } from 'react-router';
import routes from '~/constants/routes.json';
import TermsPage from './About/TermsPage/TermsPage';
import SettingsPage from './SettingsPage';

export default function SettingsRouter(): JSX.Element {
    return (
        <Switch>
            <Route path={routes.SETTINGS_TERMS} component={TermsPage} />
            <Route path={routes.SETTINGS} component={SettingsPage} />
        </Switch>
    );
}
