import React, { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Modal from '~/cross-app-components/Modal';
import Form from '~/components/Form';
import styles from './InputModal.module.scss';

interface Props {
    title: string;
    text?: string;
    buttonText: string;
    open: boolean;
    type?: string;
    onClose(): void;
    placeholder: string;
    validValue(value: string): string | undefined;
    buttonOnClick(value: string): void;
}

interface InputForm {
    value: string;
}

function InputModal({
    title,
    text,
    buttonText,
    validValue,
    buttonOnClick,
    placeholder,
    type = 'text',
    open,
    onClose,
}: Props) {
    const handleSubmit: SubmitHandler<InputForm> = useCallback(
        (values) => {
            const { value } = values;
            buttonOnClick(value);
        },
        [buttonOnClick]
    );

    return (
        <Modal onClose={onClose} onOpen={() => {}} open={open}>
            <h2>{title}</h2>
            <p className={styles.text}>{text}</p>
            <Form onSubmit={handleSubmit}>
                <Form.Input
                    className={styles.formInput}
                    name="value"
                    rules={{ validate: validValue }}
                    placeholder={placeholder}
                    type={type}
                />
                <Form.Submit>{buttonText}</Form.Submit>
            </Form>
        </Modal>
    );
}

export default InputModal;
