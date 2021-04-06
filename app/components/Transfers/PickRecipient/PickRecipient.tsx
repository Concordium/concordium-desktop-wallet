import React from 'react';
import { AddressBookEntry } from '~/utils/types';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import AddressBookSearchList from '../../AddressBookSearchList';
import styles from './PickRecipient.module.scss';

interface Props {
    pickRecipient(recipient: AddressBookEntry): void;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 */
export default function PickRecipient({ pickRecipient }: Props) {
    return (
        <div className={styles.root}>
            <AddressBookSearchList className={styles.search}>
                {(e) => (
                    <AddressBookEntryButton
                        className={styles.item}
                        key={e.address}
                        onClick={() => pickRecipient(e)}
                        title={e.name}
                        comment={e.note}
                    />
                )}
            </AddressBookSearchList>
        </div>
    );
}
