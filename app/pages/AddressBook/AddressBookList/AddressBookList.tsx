import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Button from '../../../cross-app-components/Button';
import routes from '../../../constants/routes.json';
import { addressBookSelector } from '../../../features/AddressBookSlice';
import IdentityIcon from '../../../../resources/svg/identity.svg';
import SearchIcon from '../../../../resources/svg/search.svg';

import styles from './AddressBookList.module.scss';
import { AddressBookEntry } from '../../../utils/types';

export default function AddressBookList(): JSX.Element {
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
                    inverted
                    icon={<IdentityIcon className={styles.identityIcon} />}
                    as={NavLink}
                    to={routes.ADDRESSBOOK_SELECTED.replace(':index', `${i}`)}
                >
                    {e.name}
                </Button>
            ))}
        </>
    );
}
