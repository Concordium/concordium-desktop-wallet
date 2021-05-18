import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import SearchIcon from '@resources/svg/search.svg';
import { addressBookSelector } from '~/features/AddressBookSlice';
import { AddressBookEntry, ClassName } from '~/utils/types';
import styles from './AddressBookSearchList.module.scss';

interface Props extends ClassName {
    /**
     * Mapping function from AddressBookEntry to list item represented in element of choice.
     * @param entry AddressBookEntry to be mapped to element.
     */
    children(entry: AddressBookEntry): JSX.Element;
    filter?: (entry: AddressBookEntry) => boolean;
}

export default function AddressBookSearchList({
    className,
    children,
    filter = () => true,
}: Props): JSX.Element {
    const [query, setQuery] = useState('');
    const addressBook = useSelector(addressBookSelector);

    const filterByQuery = useCallback(
        (e: AddressBookEntry) =>
            e.name.toLocaleLowerCase().includes(query.toLowerCase()) ||
            e.address === query,
        [query]
    );

    return (
        <>
            <div className={clsx(styles.search, className)}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    type="search"
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search recipients"
                />
            </div>
            {addressBook.filter(filter).filter(filterByQuery).map(children)}
        </>
    );
}
