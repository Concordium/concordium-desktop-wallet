import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PlusIcon from '@resources/svg/plus.svg';
import SearchIcon from '@resources/svg/search.svg';
import { addressBookSelector } from '~/features/AddressBookSlice';
import UpsertAddress from '../UpsertAddress';
import { AddressBookEntry } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import styles from './Transfers.module.scss';
import searchStyles from '~/pages/AddressBook/AddressBookList/AddressBookList.module.scss';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';

interface Props {
    pickRecipient(recipient: AddressBookEntry): void;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 */
export default function PickRecipient({ pickRecipient }: Props) {
    const addressBook = useSelector(addressBookSelector);
    const [filter, setFilter] = useState<string>('');

    function onSubmit(name: string, address: string, note: string) {
        pickRecipient({
            name,
            address,
            note,
        } as AddressBookEntry);
    }

    return (
        <div className={styles.pickRecipient}>
            <div className={searchStyles.search}>
                <SearchIcon className={searchStyles.searchIcon} />
                <input
                    type="search"
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search recipients"
                />
                <UpsertAddress
                    as={Button}
                    size="small"
                    clear
                    onSubmit={onSubmit}
                >
                    <PlusIcon />
                </UpsertAddress>
            </div>
            {addressBook
                .filter((entry: AddressBookEntry) =>
                    entry.name.includes(filter)
                )
                .map((e: AddressBookEntry) => (
                    <AddressBookEntryButton
                        className={styles.button}
                        key={e.address}
                        onClick={() => pickRecipient(e)}
                    >
                        {e.name}
                        <br />
                        <div className={styles.addressBookComment}>
                            {e.note}
                        </div>
                    </AddressBookEntryButton>
                ))}
        </div>
    );
}
