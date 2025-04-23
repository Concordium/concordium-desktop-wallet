import waitForPreloadReady from "../utils/preloadReady";

await waitForPreloadReady();

export const { insert, findEntries } = window.database.decyptedAmounts;
