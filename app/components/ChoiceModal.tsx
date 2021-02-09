import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { Action } from '../utils/types';

interface Props {
    title: string;
    description: string;
    actions: Action[];
    open: boolean;
    postAction(): void;
}

export default function ChoiceModal({
    title,
    description,
    actions,
    open,
    postAction,
}: Props) {
    return (
        <Modal
            closeIcon
            centered
            open={open}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content>{description}</Modal.Content>
            <Modal.Actions>
                {actions.map(({ label, onClick }) => (
                    <Button
                        primary
                        key={label}
                        onClick={() => {
                            onClick();
                            postAction();
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </Modal.Actions>
        </Modal>
    );
}
