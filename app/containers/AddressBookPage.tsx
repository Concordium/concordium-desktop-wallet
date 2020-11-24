import React from 'react';
import * as storage from '../utils/persistentStorage.ts';

function save(addressBook) {
  storage.saveAddressBook(addressBook);
}

export default function AddressBookPage() {
  // const addressBook = await storage.loadAddressBook();
  const addressBook = [
    { name: 'Bob', address: '1AB5F2', note: 'is a friend.' },
    { name: 'Eve', address: '1ABAS5', note: 'is not a friend.' },
  ];
  storage.saveAddressBook(addressBook);
  return (
    <div>
      {addressBook.map((entry, i) => (
        <div key={entry.address}>
          {entry.name}
          {'\n'}
          {entry.address}
          {'\n'}
          {entry.note}
          {'\n'}
          {'\n'}
        </div>
      ))}
    </div>
  );
}
