/* eslint-disable import/no-mutable-exports */
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
