import React from 'react';
import Button from '~/cross-app-components/Button';
import Modal from '~/cross-app-components/Modal';

export interface ModalErrorInput {
    show: boolean;
    header?: string;
    content?: string;
    buttonText?: string;
}

interface Props extends ModalErrorInput {
    onClick?(): void;
    disableClose?: boolean;
}

/**
 * A simple modal to be used for displaying simple errors, where there is no
 * action performed when user presses the button other than hiding the modal.
 */
export default function SimpleErrorModal({
    show,
    header,
    content,
    buttonText = 'Okay',
    disableClose = true,
    onClick,
}: Props) {
    return (
        <Modal open={show} disableClose={disableClose}>
            <h2>{header}</h2>
            <p>{content}</p>
            <Button className="mT40" onClick={onClick}>
                {buttonText}
            </Button>
        </Modal>
    );
}
