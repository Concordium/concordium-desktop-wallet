import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { updateSettings, findSetting } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import listenForTransactionStatus from './utils/TransactionStatusPoller';
import { Dispatch } from './utils/types';
import { startClient } from './utils/nodeRequests';
import listenForIdentityStatus from './utils/IdentityStatusPoller';
import listenForAccountStatus from './utils/AccountStatusPoller';
import { loadAccounts } from './features/AccountSlice';
import { loadIdentities } from './features/IdentitySlice';

import './styles/app.global.scss';

const store = configuredStore();

/**
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore(dispatch: Dispatch) {
    const settings = await loadAllSettings();
    const nodeLocationSetting = findSetting('Node location', settings);
    if (nodeLocationSetting) {
        startClient(nodeLocationSetting);
    } else {
        throw new Error('unable to find Node location settings.');
    }
    return dispatch(updateSettings(settings));
}

async function onLoad(dispatch: Dispatch) {
    await loadSettingsIntoStore(dispatch);
    loadAccounts(dispatch);
    loadIdentities(dispatch);

    listenForAccountStatus(dispatch);
    listenForIdentityStatus(dispatch);
    listenForTransactionStatus(dispatch);
}

onLoad(store.dispatch);

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
    render(
        <AppContainer>
            <Root store={store} history={history} />
        </AppContainer>,
        document.getElementById('root')
    )
);
