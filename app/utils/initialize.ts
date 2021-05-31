import { loadAllSettings } from '~/database/SettingsDao';
import { loadAccounts } from '~/features/AccountSlice';
import { loadAddressBook } from '~/features/AddressBookSlice';
import { loadCredentials } from '~/features/CredentialSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import { loadProposals } from '~/features/MultiSignatureSlice';
import { findSetting, updateSettings } from '~/features/SettingsSlice';
import listenForIdentityStatus from './IdentityStatusPoller';
import startClient from '../node/nodeConnector';
import { Dispatch } from './types';
import settingKeys from '../constants/settingKeys.json';

/**
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore(dispatch: Dispatch) {
    const settings = await loadAllSettings();
    const nodeLocationSetting = findSetting(settingKeys.nodeLocation, settings);
    if (nodeLocationSetting) {
        const { address, port } = JSON.parse(nodeLocationSetting.value);
        startClient(dispatch, address, port);
    } else {
        throw new Error('Unable to find node location setting.');
    }

    return dispatch(updateSettings(settings));
}

/**
 * Initializes the application by loading data from the database into the
 * state.
 * Also starts listening for the status of identities.
 */
export default async function initApplication(dispatch: Dispatch) {
    await loadSettingsIntoStore(dispatch);

    await Promise.all([
        loadAddressBook(dispatch),
        loadAccounts(dispatch),
        loadIdentities(dispatch),
        loadProposals(dispatch),
        loadCredentials(dispatch),
    ]);

    listenForIdentityStatus(dispatch);
}
