import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import {
    addressBookSelector,
    removeFromAddressBook,
} from '../../../features/AddressBookSlice';
import DeleteAddress from '../DeleteAddress';
import UpsertAddress from '../../../components/UpsertAddress';
import Card from '../../../cross-app-components/Card';
import Button from '../../../cross-app-components/Button';

import EditIcon from '../../../../resources/svg/edit.svg';
import CopyIcon from '../../../../resources/svg/copy.svg';
import CheckmarkIcon from '../../../../resources/svg/checkmark-blue.svg';

import styles from './AddressBookSelected.module.scss';

function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
}

export default function AddressBookElementView() {
    const [copied, setCopied] = useState(false);
    const dispatch = useDispatch();
    const { index } = useParams<{ index: string }>();
    // eslint-disable-next-line radix
    const chosenIndex = useMemo(() => parseInt(index), [index]);

    const addressBook = useSelector(addressBookSelector);
    const chosenEntry = addressBook[chosenIndex];

    const copyAddress = useCallback(async () => {
        if (!chosenEntry.address) {
            return;
        }

        try {
            await copyToClipboard(chosenEntry.address);
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Could not copy address');
        }
    }, [chosenEntry?.address]);

    if (chosenIndex >= addressBook.length) {
        return null;
    }

    return (
        <Card className={styles.root}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h2 className={styles.heading}>{chosenEntry.name}</h2>
                    <span className={styles.actions}>
                        <UpsertAddress
                            disabled={chosenEntry.readOnly}
                            initialValues={chosenEntry}
                            clear
                        >
                            <EditIcon width="22" className={styles.icon} />
                        </UpsertAddress>
                        <DeleteAddress
                            entry={chosenEntry}
                            onRemove={(entry) =>
                                removeFromAddressBook(dispatch, entry)
                            }
                        />
                    </span>
                </header>
                <div className={styles.address}>
                    {chosenEntry.address}
                    <Button className={styles.copy} clear onClick={copyAddress}>
                        {copied ? (
                            <CheckmarkIcon width="18" />
                        ) : (
                            <CopyIcon width="18" className={styles.icon} />
                        )}
                    </Button>
                </div>
                <div>
                    <h3 className={styles.notesHeading}>Notes</h3>
                    {chosenEntry.note}
                </div>
            </div>
        </Card>
    );
}
