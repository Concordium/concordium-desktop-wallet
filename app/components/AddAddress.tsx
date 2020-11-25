import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    addToAddressBook
} from '../features/AddressBookSlice.ts';

export default function AddAddress(close) {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const dispatch = useDispatch();

    function submit() {
        const address = {
            name: name,
            address: address,
            note: note
        }
        dispatch(addToAddressBook(address));
            close();
    };

    return (
        <div>
            <input
        name="name"
        placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
        data-tid="hashInput"
        />
        <input
        name="address"
        placeholder="Enter Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        data-tid="hashInput"
        />
        <input
        name="notes"
        placeholder="Enter Notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        data-tid="hashInput"
        />
        <button onClick={submit}>submit</button>
        </div>
    );
}
