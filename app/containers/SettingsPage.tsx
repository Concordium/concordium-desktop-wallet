import React from 'react';
import SettingsList from '../components/settings/SettingsList';
import SettingsView from '../components/settings/SettingsView';
import { Grid } from 'semantic-ui-react';

export default function SettingsPage() {
    return (
        <Grid container columns={2} divided>
            <Grid.Row>
                <Grid.Column>
                    <SettingsList />
                </Grid.Column>
                <Grid.Column>
                    <SettingsView />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
