/* eslint-disable import/no-mutable-exports */
/**
 * NOTE: These functions are loaded from the preload script, but they are not available right away.
 *
 * We have to wait for the preload to finish before we can use `window.database`.
 * However, if we use `await` at the top level, TypeScript throws the following error during Jest tests:
 *
 *   error TS1378: Top-level 'await' expressions are only allowed when the 'module' option is set to
 *   'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher.
 *
 * Even though our `tsconfig.json` already includes:
 *
 *     "target": "ES2020",
 *     "module": "ESNext",
 *
 * this error still appears when running tests
 *
 * To avoid changing the whole app setup or Jest environment, we use this workaround:
 *
 * 1. Declare the variables (`let ...`)
 * 2. Wait for preload inside an async IIFE, then assign the values
 * 3. Export the variables so other parts of the app can use them
 *
 * This ensures we don’t access uninitialized APIs and keeps both the app and tests working properly.
 */
import waitForPreloadReady from '../utils/preloadReady';

let getAddressBook: typeof window.database.addressBook.getAll;
let insertEntry: typeof window.database.addressBook.insert;
let updateEntry: typeof window.database.addressBook.update;
let removeEntry: typeof window.database.addressBook.remove;
let findEntries: typeof window.database.addressBook.findEntries;

(async () => {
    await waitForPreloadReady();
    ({
        getAll: getAddressBook,
        insert: insertEntry,
        update: updateEntry,
        remove: removeEntry,
        findEntries,
    } = window.database.addressBook);
})();

export { getAddressBook, insertEntry, updateEntry, removeEntry, findEntries };
