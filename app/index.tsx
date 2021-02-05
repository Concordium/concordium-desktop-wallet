import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './styles/app.global.scss';
import { updateSettings, findSetting } from './features/SettingsSlice';
import { loadAllSettings } from './database/SettingsDao';
import { getAll } from './database/MultiSignatureProposalDao';
import {
    getMultiSignatureTransactionStatus,
    monitorTransactionStatus,
} from './utils/TransactionStatusPoller';
import {
    MultiSignatureTransactionStatus,
    Settings,
    Dispatch,
    IdentityStatus,
    AccountStatus,
} from './utils/types';
import { setClientLocation } from './utils/client';
import { getAllIdentities } from './database/IdentityDao';
import { resumeIdentityStatusPolling } from './utils/IdentityStatusPoller';
import resumeAccountStatusPolling from './utils/AccountStatusPoller';
import { getAllAccounts } from './database/AccountDao';
import { getPendingTransactions } from './database/TransactionDao';

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

// TODO filter out initial accounts
async function listenForAccountStatus(dispatch: Dispatch) {
    const accounts = await getAllAccounts();
    accounts
        .filter((account) => account.status === AccountStatus.Pending)
        .forEach((account) => resumeAccountStatusPolling(account, dispatch));
}
listenForAccountStatus(store.dispatch);

async function listenForIdentityStatus(dispatch: Dispatch) {
    const identities = await getAllIdentities();
    identities
        .filter((identity) => identity.status === IdentityStatus.Pending)
        .forEach((identity) => resumeIdentityStatusPolling(identity, dispatch));
}
listenForIdentityStatus(store.dispatch);

/**
 * Load all submitted proposals and sent transfers from the database, and
 * start listening for their status towards the node.
 */
async function listenForTransactionStatus(dispatch: Dispatch) {
    const transfers = await getPendingTransactions();
    transfers.forEach((transfer) =>
        monitorTransactionStatus(transfer.transactionHash)
    );

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
