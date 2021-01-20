import React from 'react';
import { Header, Menu } from 'semantic-ui-react';
import { AddressBookEntry } from '../utils/types';

interface Props {
    entry: AddressBookEntry;
    onClick(): void;
}

export default function AddressBookListElement({ entry, onClick }: Props) {
    return (
        <Menu.Item key={entry.address} onClick={onClick}>
            <Header>{entry.name}</Header>
        </Menu.Item>
    );
}
