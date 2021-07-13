import React from 'react';
import clsx from 'clsx';

import { AddressBookEntry } from '~/utils/types';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import AddressBookSearchList from '../../AddressBookSearchList';
import styles from './PickRecipient.module.scss';
import { noOp } from '~/utils/basicHelpers';

interface Props {
    recipient?: AddressBookEntry;
    pickRecipient(recipient: AddressBookEntry): void;
    senderAddress?: string;
    onClickedRecipient?(): void;
}

/**
 * Allows the user to pick a entry in the AddressBook.
 * @param senderAddress optional parameter, if given, the AddressBookEntry with the given address will be filtered out of the list.
 */
export default function PickRecipient({
    pickRecipient,
    senderAddress,
    recipient,
    onClickedRecipient = noOp,
}: Props) {
    const filter = senderAddress
        ? (abe: AddressBookEntry) => abe.address !== senderAddress
        : undefined;
    return (
        <div className={styles.root}>
            <AddressBookSearchList className={styles.search} filter={filter}>
                {(e) => (
                    <AddressBookEntryButton
                        className={clsx(
                            styles.item,
                            recipient?.address === e.address && 'active'
                        )}
                        key={e.address}
                        onClick={() => {
                            pickRecipient(e);
                            onClickedRecipient();
                        }}
                        title={e.name}
                        comment={e.note}
                    />
                )}
            </AddressBookSearchList>
        </div>
    );
}
