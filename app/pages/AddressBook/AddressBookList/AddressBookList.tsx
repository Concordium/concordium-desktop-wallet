import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../../cross-app-components/Button';
import {
    chooseIndex,
    addressBookSelector,
    chosenIndexSelector,
} from '../../../features/AddressBookSlice';
import IdentityIcon from '../../../../resources/svg/identity.svg';
import SearchIcon from '../../../../resources/svg/search.svg';

import styles from './AddressBookList.module.scss';
import { AddressBookEntry } from '../../../utils/types';

export default function AddressBookList(): JSX.Element {
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenIndexSelector);
    const addressBook = useSelector(addressBookSelector);

    const filterByQuery = useCallback(
        (e: AddressBookEntry) =>
            e.name.toLocaleLowerCase().includes(query.toLowerCase()) ||
            e.address === query,
        [query]
    );

    return (
        <>
            <div className={styles.search}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    type="search"
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search recipients"
                />
            </div>
            {addressBook.filter(filterByQuery).map((e, i) => (
                <Button
                    className={styles.item}
                    key={e.address}
                    size="huge"
                    onClick={() => dispatch(chooseIndex(i))}
                    inverted
                    active={i === chosenIndex}
                    icon={<IdentityIcon className={styles.identityIcon} />}
                >
                    {e.name}
                </Button>
            ))}
        </>
    );
}
