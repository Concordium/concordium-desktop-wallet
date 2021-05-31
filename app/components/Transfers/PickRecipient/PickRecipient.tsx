import React from 'react';
import { AddressBookEntry } from '~/utils/types';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import AddressBookSearchList from '../../AddressBookSearchList';
import styles from './PickRecipient.module.scss';

interface Props {
    pickRecipient(recipient: AddressBookEntry): void;
    senderAddress?: string;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 * @param senderAddress optional parameter, if given, the AddressBookEntry with the given address will be filtered out of the list.
 */
export default function PickRecipient({ pickRecipient, senderAddress }: Props) {
    const filter = senderAddress
        ? (abe: AddressBookEntry) => abe.address !== senderAddress
        : undefined;
    return (
        <div className={styles.root}>
            <AddressBookSearchList className={styles.search} filter={filter}>
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
