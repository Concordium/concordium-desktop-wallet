import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './styles/app.global.scss';
import { updateSettings, findSetting } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import listenForTransactionStatus from './utils/TransactionStatusPoller';
import { Settings } from './utils/types';
import { setClientLocation } from './utils/client';
import listenForIdentityStatus from './utils/IdentityStatusPoller';
import listenForAccountStatus from './utils/AccountStatusPoller';

const store = configuredStore();

// Extracts node location from settings, and pass them to the grpc client.
function startClient(settings: Settings[]) {
    const nodeLocationSetting = findSetting('Node location', settings);
    if (nodeLocationSetting) {
        const { address, port } = JSON.parse(nodeLocationSetting.value);
        setClientLocation(address, port);
    } else {
        throw new Error('unable to find Node location settings.');
    }
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

listenForAccountStatus(store.dispatch);

listenForIdentityStatus(store.dispatch);

listenForTransactionStatus(store.dispatch);

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
