import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { addressBookSelector } from '../../../features/AddressBookSlice';
import AddressBookEntryIcon from '../../../../resources/svg/identity.svg';
import SearchIcon from '../../../../resources/svg/search.svg';

import styles from './AddressBookList.module.scss';
import { AddressBookEntry } from '../../../utils/types';
import ButtonNavLink from '../../../components/ButtonNavLink';
import { selectedAddressBookEntryRoute } from '../../../utils/routerHelper';

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
            {addressBook.filter(filterByQuery).map((e) => (
                <ButtonNavLink
                    className={styles.item}
                    key={e.address}
                    icon={
                        <AddressBookEntryIcon className={styles.identityIcon} />
                    }
                    to={selectedAddressBookEntryRoute(e.address)}
                >
                    {e.name}
                </ButtonNavLink>
            ))}
        </>
    );
}
