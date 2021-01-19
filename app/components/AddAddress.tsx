import React, { useState, useEffect } from 'react';
import styles from './Styling.css';
import { AddressBookEntry } from '../utils/types';

interface Props {
    close(): void;
    submit(name: string, address: string, note: string): void;
    initialValues?: AddressBookEntry;
}

function AddAddress({ close, submit, initialValues }: Props) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name);
            setAddress(initialValues.address);
            setNote(initialValues.note);
        }
    }, [initialValues, setName, setAddress, setNote]);

    return (
        <div>
            <span className={styles.modalElement}>
                <input
                    name="name"
                    className={styles.input}
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <span className={styles.modalElement}>
                <input
                    name="address"
                    className={styles.input}
                    placeholder="Enter Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <span className={styles.modalElement}>
                <input
                    name="notes"
                    className={styles.input}
                    placeholder="Enter Notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <button
                type="button"
                onClick={() => {
                    submit(name, address, note);
                    close();
                }}
            >
                submit
            </button>
        </div>
    );
}

AddAddress.defaultProps = {
    initialValues: undefined,
};

export default AddAddress;
