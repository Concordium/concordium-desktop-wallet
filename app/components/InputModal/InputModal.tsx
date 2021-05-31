import React, { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Modal from '~/cross-app-components/Modal';
import Form from '~/components/Form';
import styles from './InputModal.module.scss';
import { ValidationRules } from '~/utils/types';

interface Props {
    title: string;
    text?: string;
    buttonText: string;
    open: boolean;
    type?: string;
    onClose(): void;
    placeholder: string;
    validationRules: ValidationRules;
    buttonOnClick(value: string): void;
}

interface InputForm {
    value: string;
}

function InputModal({
    title,
    text,
    buttonText,
    validationRules,
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
                    rules={validationRules}
                    placeholder={placeholder}
                    type={type}
                />
                <Form.Submit className="mT100">{buttonText}</Form.Submit>
            </Form>
        </Modal>
    );
}

export default InputModal;
