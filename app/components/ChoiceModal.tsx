import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
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
    const dispatch = useDispatch();
    return (
        <Modal
            centered
            open={open}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>{title}</Modal.Header>
            <Modal.Content>{description}</Modal.Content>
            <Modal.Actions>
                {actions.map(({ label, location }) => (
                    <Button
                        primary
                        key={label}
                        onClick={() => {
                            if (location) {
                                dispatch(push(location));
                            }
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
