import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import BinIcon from '@resources/svg/bin.svg';
import { Identity } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import IconButton from '~/cross-app-components/IconButton';
import Modal from '~/cross-app-components/Modal';
import { removeIdentity } from '~/features/IdentitySlice';

interface DeleteAddressProps {
    identity: Identity;
}

export default function DeleteIdentity({ identity }: DeleteAddressProps) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    function remove(): void {
        window.log.info(`Removing failed identity ${identity.id}`);
        removeIdentity(dispatch, identity.id);
        setOpen(false);
    }

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={
                <IconButton>
                    <BinIcon height="20" />
                </IconButton>
            }
        >
            <h2 className="mV50">
                Are you sure you want to delete the identity &apos;
                {identity.name}&apos;?
            </h2>
            <div className="flex justifyCenter">
                <Button className="mR40" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={remove} negative>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}
