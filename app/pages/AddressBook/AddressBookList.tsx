import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List, Menu } from 'semantic-ui-react';
import {
    chooseIndex,
    addressBookSelector,
} from '../../features/AddressBookSlice';
import AddressBookListElement from './AddressBookListElement';

export default function AddressBookList(): JSX.Element {
    const dispatch = useDispatch();

    const addressBook = useSelector(addressBookSelector);

    return (
        <List>
            <List.Item>
                <Menu vertical size="massive" fluid>
                    {addressBook.map((entry, i) => (
                        <AddressBookListElement
                            key={entry.address}
                            entry={entry}
                            onClick={() => dispatch(chooseIndex(i))}
                        />
                    ))}
                </Menu>
            </List.Item>
        </List>
    );
}
