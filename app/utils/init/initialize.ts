import { loadAllSettings } from '~/database/SettingsDao';
import { initAccounts } from '~/features/AccountSlice';
import { loadAddressBook } from '~/features/AddressBookSlice';
import { init as initChainData } from '~/features/ChainDataSlice';
import {
    loadCredentials,
    loadExternalCredentials,
} from '~/features/CredentialSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import { loadProposals } from '~/features/MultiSignatureSlice';
import { findSetting, updateSettings } from '~/features/SettingsSlice';
import listenForIdentityStatus from '../IdentityStatusPoller';
import startClient from '../../node/nodeConnector';
import { Dispatch } from '../types';
import settingKeys from '../../constants/settingKeys.json';
import { unlock } from '~/features/MiscSlice';
import { throwLoggedError } from '../basicHelpers';
import checkForClosingBakerPools from './closingBakerPoolChecker';

/**
 * Loads settings from the database into the store.
 */
async function loadSettingsIntoStore(dispatch: Dispatch) {
    const settings = await loadAllSettings();
    const nodeLocationSetting = findSetting(settingKeys.nodeLocation, settings);
    if (nodeLocationSetting) {
        const { address, port, useSsl } = JSON.parse(nodeLocationSetting.value);
        startClient(dispatch, address, port, Boolean(useSsl));
    } else {
        throwLoggedError('Unable to find node location setting.');
    }

    return dispatch(updateSettings(settings));
}

/**
 * Initializes the application by loading data from the database into the
 * state.
 * Also starts listening for the status of identities and ensures notifications
 * are created for accounts delegating to a closing baker pool.
 */
export default async function initApplication(dispatch: Dispatch) {
    await loadSettingsIntoStore(dispatch);
    initChainData(dispatch);

    await Promise.all([
        loadAddressBook(dispatch),
        initAccounts(dispatch),
        loadIdentities(dispatch),
        loadProposals(dispatch),
        loadCredentials(dispatch),
        loadExternalCredentials(dispatch),
    ]);

    dispatch(unlock());
    listenForIdentityStatus(dispatch);
    checkForClosingBakerPools(dispatch).catch((e) =>
        window.log.error(e, 'Error while checking for closing staking pools')
    );
}
