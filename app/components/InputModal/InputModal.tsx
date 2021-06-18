import React, { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Modal, { ModalProps } from '~/cross-app-components/Modal';
import Form from '~/components/Form';
import styles from './InputModal.module.scss';
import { ValidationRules } from '~/utils/types';

interface Props
    extends Pick<ModalProps, 'trigger' | 'open' | 'onClose' | 'onOpen'> {
    title: string;
    text?: string;
    buttonText: string;
    type?: string;
    placeholder: string;
    validationRules?: ValidationRules;
    buttonOnClick(value: string): void;
    defaultValue?: string;
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
    defaultValue,
    ...modalProps
}: Props) {
    const handleSubmit: SubmitHandler<InputForm> = useCallback(
        (values) => {
            const { value } = values;
            buttonOnClick(value);
        },
        [buttonOnClick]
    );

    return (
        <Modal {...modalProps}>
            <h2>{title}</h2>
            <p className={styles.text}>{text}</p>
            <Form onSubmit={handleSubmit}>
                <Form.Input
                    className={styles.formInput}
                    name="value"
                    rules={validationRules}
                    placeholder={placeholder}
                    type={type}
                    defaultValue={defaultValue}
                />
                <Form.Submit className="mT100">{buttonText}</Form.Submit>
            </Form>
        </Modal>
    );
}

export default InputModal;
