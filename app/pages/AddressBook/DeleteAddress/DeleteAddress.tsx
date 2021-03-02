import React, { useState } from 'react';
import { Button as SemanticButton, Icon, Modal } from 'semantic-ui-react';
import { AddressBookEntry } from '../../../utils/types';

import BinIcon from '../../../../resources/svg/bin.svg';
import Button from '../../../cross-app-components/Button';

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
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                <Button clear className={styles.deleteButton}>
                    <BinIcon className={styles.binIcon} />
                </Button>
            }
            dimmer="blurring"
            closeOnDimmerClick={false}
            basic
            size="mini"
        >
            <Modal.Header>
                Are you sure you want to delete this entry? The address will be
                lost.
            </Modal.Header>
            <Modal.Actions>
                <SemanticButton
                    disabled={entry.readOnly}
                    onClick={() => setOpen(false)}
                >
                    <Icon name="remove" />
                    Cancel
                </SemanticButton>
                <SemanticButton
                    negative
                    disabled={entry.readOnly}
                    onClick={remove}
                >
                    <Icon name="checkmark" />
                    Yes, I&apos;m sure.
                </SemanticButton>
            </Modal.Actions>
        </Modal>
    );
}
