import React from 'react';
import AddressBookList from '../components/AddressBookList';
import AddressBookElementView from '../components/AddressBookElementView';
import styles from './Pages.css';

export default function AddressBookPage() {
    return (
        <div className={styles.splitPage}>
            <AddressBookList />
            <AddressBookElementView />
        </div>
    );
}
