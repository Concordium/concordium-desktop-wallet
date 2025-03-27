export const getAddressBook: typeof window.database.addressBook.getAll = (...args) => window.database.addressBook.getAll(...args);
export const insertEntry: typeof window.database.addressBook.insert = (...args) => window.database.addressBook.insert(...args);
export const updateEntry: typeof window.database.addressBook.update = (...args) => window.database.addressBook.update(...args);
export const removeEntry: typeof window.database.addressBook.remove = (...args) => window.database.addressBook.remove(...args);
export const findEntries: typeof window.database.addressBook.findEntries = (...args) => window.database.addressBook.findEntries(...args);
