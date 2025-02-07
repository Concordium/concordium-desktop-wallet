import React from 'react';
import clsx from 'clsx';

import { AccountAddress } from '@concordium/web-sdk';

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
 * Allows the user to pick an entry from the address book.
 * @param senderAddress if provided any address book entry that is an alias of that address will not be selectable
 */
export default function PickRecipient({
    pickRecipient,
    senderAddress,
    recipient,
    onClickedRecipient = noOp,
}: Props) {
    let filter;
    if (senderAddress) {
        const senderAccountAddress = AccountAddress.fromBase58(senderAddress);
        filter = (entry: AddressBookEntry) =>
            !AccountAddress.isAlias(
                senderAccountAddress,
                AccountAddress.fromBase58(entry.address)
            );
    }

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
