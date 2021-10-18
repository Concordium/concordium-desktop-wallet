import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import clsx from 'clsx';
import {
    addressBookSelector,
    removeFromAddressBook,
} from '~/features/AddressBookSlice';
import DeleteAddress from '../DeleteAddress';
import UpsertAddress from '~/components/UpsertAddress';
import Card from '~/cross-app-components/Card';
import DisplayAddress from '~/components/DisplayAddress';

import EditIcon from '~/../resources/svg/edit.svg';
import CopyButton from '~/components/CopyButton';

import styles from './AddressBookSelected.module.scss';

export default function AddressBookElementView() {
    const dispatch = useDispatch();
    const { address } = useParams<{ address: string }>();

    const addressBook = useSelector(addressBookSelector);
    const chosenEntry = addressBook.find((e) => e.address === address);

    if (!chosenEntry) {
        return null;
    }

    return (
        <Card className={styles.root}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>{chosenEntry.name}</h2>
                    <span className={styles.actions}>
                        <UpsertAddress
                            initialValues={chosenEntry}
                            clear
                            readOnly={chosenEntry.readOnly}
                        >
                            <EditIcon width="22" className={styles.icon} />
                        </UpsertAddress>
                        {!chosenEntry.readOnly && (
                            <DeleteAddress
                                entry={chosenEntry}
                                onRemove={(entry) =>
                                    removeFromAddressBook(dispatch, entry)
                                }
                            />
                        )}
                    </span>
                </header>
                <div className={styles.address}>
                    <DisplayAddress
                        lineClassName="body3"
                        lineLength={25}
                        address={chosenEntry.address}
                    />
                    <CopyButton
                        className={styles.copy}
                        value={chosenEntry.address}
                    />
                </div>
                <div className={clsx(!chosenEntry.note && styles.notesHidden)}>
                    <h3 className={styles.notesHeading}>Notes</h3>
                    {chosenEntry.note}
                </div>
            </div>
        </Card>
    );
}
