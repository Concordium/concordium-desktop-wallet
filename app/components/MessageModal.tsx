import React from 'react';
import Modal from '~/cross-app-components/Modal';
import Button from '~/cross-app-components/Button';

interface Props {
    title: string;
    buttonText: string;
    open: boolean;
    onClose(): void;
}

export default function MessageModal({
    title,
    buttonText,
    open,
    onClose,
}: Props) {
    return (
        <Modal onClose={onClose} onOpen={() => {}} open={open}>
            <h2>{title}</h2>
            <Button onClick={onClose} className="mT50">
                {buttonText}
            </Button>
        </Modal>
    );
}
