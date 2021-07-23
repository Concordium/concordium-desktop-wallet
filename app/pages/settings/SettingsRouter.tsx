import React from 'react';
import { Route, Switch } from 'react-router';
import routes from '~/constants/routes.json';
import SettingsPage from './SettingsPage';

export default function SettingsRouter(): JSX.Element {
    return (
        <Switch>
            <Route path={routes.SETTINGS} component={SettingsPage} />
        </Switch>
    );
}
