import React, { useState } from 'react';
import { Button, Icon, Modal } from 'semantic-ui-react';
import { AddressBookEntry } from '../../utils/types';

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
                <Button negative disabled={entry.readOnly}>
                    Delete
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
                <Button
                    disabled={entry.readOnly}
                    onClick={() => setOpen(false)}
                >
                    <Icon name="remove" />
                    Cancel
                </Button>
                <Button negative disabled={entry.readOnly} onClick={remove}>
                    <Icon name="checkmark" />
                    Yes, I&apos;m sure.
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
