import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'semantic-ui-react';
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
        <Form
            onSubmit={() => {
                submit(name, address, note);
                close();
            }}
        >
            <Form.Field>
                <Input
                    placeholder="Enter recipient name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Form.Field>
            <Form.Field>
                <Input
                    placeholder="Paste the account address here"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </Form.Field>
            <Form.Field>
                <Input
                    placeholder="You can add a note here"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </Form.Field>
            <Button positive type="submit">
                Submit
            </Button>
        </Form>
    );
}

AddAddress.defaultProps = {
    initialValues: undefined,
};

export default AddAddress;
