import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './styles/app.global.scss';
import { updateSettings, findSetting } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import { getAll } from './database/MultiSignatureProposalDao';
import getMultiSignatureTransactionStatus from './utils/TransactionStatusPoller';
import { MultiSignatureTransactionStatus } from './utils/types';
import { setClientLocation } from './utils/client';

const store = configuredStore();

// Extracts node location from settings, and pass them to the grpc client.
function startClient(settings) {
    const nodeLocationSetting = findSetting('Node location', settings);
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

/**
 * Load all submitted proposals from the database, and
 * start listening for their status towards the node.
 */
async function listenForTransactionStatus(dispatch) {
    const allProposals = await getAll();
    allProposals
        .filter(
            (proposal) =>
                proposal.status === MultiSignatureTransactionStatus.Submitted
        )
        .forEach((proposal) => {
            getMultiSignatureTransactionStatus(proposal, dispatch);
        });
}
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
