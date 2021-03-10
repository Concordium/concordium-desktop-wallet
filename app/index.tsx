import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './shell/Root';
import { history, configuredStore } from './store/store';
import { updateSettings, findSetting } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import { Dispatch } from './utils/types';
import startClient from './utils/nodeConnector';
import listenForIdentityStatus from './utils/IdentityStatusPoller';
import { loadAddressBook } from './features/AddressBookSlice';
import { loadAccounts } from './features/AccountSlice';
import { loadIdentities } from './features/IdentitySlice';

import './styles/app.global.scss';
import { loadProposals } from './features/MultiSignatureSlice';

const store = configuredStore();

/**
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore(dispatch: Dispatch) {
    const settings = await loadAllSettings();
    const nodeLocationSetting = findSetting('Node location', settings);
    if (nodeLocationSetting) {
        const { address, port } = JSON.parse(nodeLocationSetting.value);
        startClient(dispatch, address, port);
    } else {
        throw new Error('unable to find Node location settings.');
    }
    return dispatch(updateSettings(settings));
}

async function onLoad(dispatch: Dispatch) {
    await loadSettingsIntoStore(dispatch);

    loadAddressBook(dispatch);
    loadAccounts(dispatch);
    loadIdentities(dispatch);
    loadProposals(dispatch);

    listenForIdentityStatus(dispatch);
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
