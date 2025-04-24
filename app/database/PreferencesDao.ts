import waitForPreloadReady from '../utils/preloadReady';

await waitForPreloadReady();

export const {
    defaultAccount,
    accountSimpleView,
} = window.database.preferences;
