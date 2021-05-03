import React from 'react';
import { Route, Switch } from 'react-router';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout/MasterDetailPageLayout';
import SettingsList from './SettingsList';
import SettingsView from './SettingsView';
import routes from '~/constants/routes.json';

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
                        path={routes.SETTINGS_SELECTED}
                        render={() => <SettingsView />}
                    />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
