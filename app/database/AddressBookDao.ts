import waitForPreloadReady from '../utils/preloadReady';

await waitForPreloadReady();

export const {
    getAll: getAddressBook,
    insert: insertEntry,
    update: updateEntry,
    remove: removeEntry,
    findEntries,
} = window.database.addressBook;
