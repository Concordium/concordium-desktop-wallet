import React from 'react';
import { Grid } from 'semantic-ui-react';
import SettingsList from '../components/settings/SettingsList';
import SettingsView from '../components/settings/SettingsView';

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
