import React from 'react';
import Modal from '~/cross-app-components/Modal';
import Button from '~/cross-app-components/Button';

interface Props {
    title: string;
    buttonText: string;
    open: boolean;
    onClose(): void;
    disableClose?: boolean;
}

export default function MessageModal({
    title,
    buttonText,
    open,
    onClose,
    disableClose,
}: Props) {
    return (
        <Modal onClose={onClose} open={open} disableClose={disableClose}>
            <h2>{title}</h2>
            <Button onClick={onClose} className="mT50">
                {buttonText}
            </Button>
        </Modal>
    );
}
