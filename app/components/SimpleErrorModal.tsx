import React from 'react';
import Button from '~/cross-app-components/Button';
import Modal from '~/cross-app-components/Modal';

export interface ModalErrorInput {
    show: boolean;
    header?: string;
    content?: string;
}

interface Props extends ModalErrorInput {
    onClick: () => void;
}

/**
 * A simple modal to be used for displaying simple errors, where there is no
 * action performed when user presses the button other than hiding the modal.
 */
export default function SimpleErrorModal({
    show,
    header,
    content,
    onClick,
}: Props) {
    return (
        <Modal open={show} disableClose>
            <h2>{header}</h2>
            <p>{content}</p>
            <Button className="mT40" onClick={onClick}>
                Okay
            </Button>
        </Modal>
    );
}
