import React, { useState } from 'react';
import { Button, Modal, Input } from 'semantic-ui-react';

interface Props {
    title: string;
    buttonText: string;
    open: boolean;
    onClose(): void;
    placeholder: string;
    validValue(value: string): boolean;
    buttonOnClick(value: string): void;
}

export default function InputModal({
    title,
    buttonText,
    validValue,
    buttonOnClick,
    placeholder,
    open,
    onClose,
}: Props) {
    const [value, setValue] = useState('');

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
            <Modal.Content>
                <Input
                    fluid
                    name="value"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                />
                <Button
                    disabled={!validValue(value)}
                    onClick={() => buttonOnClick(value)}
                >
                    {buttonText}
                </Button>
            </Modal.Content>
        </Modal>
    );
}
