import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';
import { updateSettings } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import { setClientLocation } from './utils/client';

const store = configuredStore();

// Extracts node location from settings, and pass them to the grpc client.
function startClient(settings) {
    const nodeSettings = settings.find((setting) => setting.type === 'node')
        .settings;
    const nodeLocationSetting = nodeSettings.find(
        (setting) => setting.id === 4
    );
    const { address, port } = JSON.parse(nodeLocationSetting.value);
    setClientLocation(address, port);
}

/**
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore() {
    const settings = await loadAllSettings();
    startClient(settings);
    return store.dispatch(updateSettings(settings));
}
loadSettingsIntoStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
    // eslint-disable-next-line global-require
    const Root = require('./containers/Root').default;
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById('root')
    );
});
