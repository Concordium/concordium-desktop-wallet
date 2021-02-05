import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

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
        <Modal
            closeIcon
            centered
            onClose={onClose}
            open={open}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>{title}</Modal.Header>
            <Modal.Actions>
                <Button primary onClick={onClose}>
                    {buttonText}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}
