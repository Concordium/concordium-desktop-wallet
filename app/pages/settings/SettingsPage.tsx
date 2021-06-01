import React from 'react';
import { Route, Switch } from 'react-router';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import SettingsList from './SettingsList';
import SettingsView from './SettingsView';
import About from './About/About';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function SettingsPage() {
    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Settings</h1>
            </Header>
            <Master>
                <SettingsList />
            </Master>
            <Detail>
                <Switch>
                    <Route
                        path={routes.SETTINGS_ABOUT}
                        render={() => <About />}
                    />
                    <Route
                        path={routes.SETTINGS_SELECTED}
                        render={() => <SettingsView />}
                    />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
