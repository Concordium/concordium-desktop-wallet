import React, { useCallback, useEffect } from 'react';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import Modal, { ModalProps } from '~/cross-app-components/Modal';
import Form from '../Form';

import styles from './SetPasswordModal.module.scss';

interface FormFields {
    password: string;
    rePassword: string;
}

interface Props {
    title: string;
    description: string;
    buttonText: string;
    open: boolean;
    onClose: ModalProps['onClose'];
    onSubmit(password: string): void;
}

export default function SetPasswordModal({
    title,
    description,
    open,
    buttonText,
    onClose,
    onSubmit,
}: Props): JSX.Element {
    const form = useForm<FormFields>({ mode: 'onTouched' });
    const { password: pwWatch } = form.watch(['password']);

    const handleSubmit: SubmitHandler<FormFields> = useCallback(
        ({ password }) => {
            onSubmit(password);
        },
        [onSubmit]
    );

    const passwordsAreEqual: Validate = useCallback(
        (value: string) => value === pwWatch || 'Passwords are not equal',
        [pwWatch]
    );

    useEffect(() => {
        if (form.formState.dirtyFields.rePassword) {
            form.trigger('rePassword');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pwWatch]);

    return (
        <Modal onClose={onClose} open={open}>
            <h2>{title}</h2>
            <p className={styles.text}>{description}</p>
            <Form<FormFields> onSubmit={handleSubmit} formMethods={form}>
                <Form.Input
                    className={styles.field}
                    name="password"
                    placeholder="Password"
                    type="password"
                    rules={{
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password has to be at least 6 characters',
                        },
                    }}
                />
                <Form.Input
                    className={styles.field}
                    name="rePassword"
                    placeholder="Repeat password"
                    type="password"
                    rules={{
                        required: 'Re-entering your password is required',
                        validate: passwordsAreEqual,
                    }}
                />
                <Form.Submit className="mT100">{buttonText}</Form.Submit>
            </Form>
        </Modal>
    );
}
