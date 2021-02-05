import React, { useState } from 'react';
import { Button, Modal, Input } from 'semantic-ui-react';

interface Props {
    title: string;
    buttonText: string;
    open: boolean;
    type?: string;
    onClose(): void;
    placeholder: string;
    validValue(value: string): boolean;
    buttonOnClick(value: string): void;
}

function InputModal({
    title,
    buttonText,
    validValue,
    buttonOnClick,
    placeholder,
    type,
    open,
    onClose,
}: Props) {
    const [value, setValue] = useState('');

    return (
        <Modal
            closeIcon
            centered
            onClose={() => {
                setValue('');
                onClose();
            }}
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
                    type={type}
                    autoFocus
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    primary
                    disabled={!validValue(value)}
                    onClick={() => {
                        buttonOnClick(value);
                        setValue('');
                    }}
                >
                    {buttonText}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

InputModal.defaultProps = {
    type: 'text',
};

export default InputModal;
