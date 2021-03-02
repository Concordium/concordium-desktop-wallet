import React, { useState } from 'react';
import { AddressBookEntry } from '../../../utils/types';
import BinIcon from '../../../../resources/svg/bin.svg';
import Button from '../../../cross-app-components/Button';
import Modal from '../../../cross-app-components/Modal';

import styles from './DeleteAddress.module.scss';

interface DeleteAddressProps {
    entry: AddressBookEntry;
    onRemove(entry: AddressBookEntry): void;
}

export default function DeleteAddress({ entry, onRemove }: DeleteAddressProps) {
    const [open, setOpen] = useState(false);

    function remove(): void {
        onRemove(entry);
        setOpen(false);
    }

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                <Button clear className={styles.deleteButton}>
                    <BinIcon className={styles.binIcon} />
                </Button>
            }
        >
            <h2>
                Are you sure you want to delete this entry? The address will be
                lost.
            </h2>
            <div className={styles.actions}>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={remove} danger>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}
