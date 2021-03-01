import React from 'react';
import { Grid } from 'semantic-ui-react';
import SettingsList from './SettingsList';
import SettingsView from './SettingsView';
import PageHeader from '../../components/PageHeader';

export default function SettingsPage() {
    return (
        <>
            <PageHeader>
                <h1>Settings</h1>
            </PageHeader>
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
        </>
    );
}
