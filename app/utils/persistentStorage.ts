import storage from 'electron-json-storage';

export async function loadAddressBook() {
    return JSON.parse(storage.get('addressbook'));
}

export async function saveAddressBook(addressBook) {
    storage.set('addressbook', JSON.stringify(addressBook));
}
