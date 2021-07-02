import React, { useState } from 'react';
import EditIcon from '@resources/svg/edit.svg';
import { useDispatch } from 'react-redux';
import Form from '~/components/Form';
import { useUpdateEffect } from '~/utils/hooks';
import Button from '~/cross-app-components/Button';
import { editAccountName } from '~/features/AccountSlice';

import styles from './AccountBalanceView.module.scss';

interface FormFields {
    name: string;
}

interface AccountNameProps {
    name: string;
    address: string;
}

export default function AccountName({ name, address }: AccountNameProps) {
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useDispatch();

    useUpdateEffect(() => {
        setIsEditing(false);
    }, [name]);

    function handleSubmit({ name: newName }: FormFields) {
        editAccountName(dispatch, address, newName);
    }

    return (
        <Form<FormFields>
            className={styles.accountName}
            onSubmit={handleSubmit}
        >
            <h2 className={styles.accountNameHeader}>
                {isEditing ? (
                    <Form.InlineInput
                        className={styles.accountNameField}
                        name="name"
                        defaultValue={name}
                        fallbackValue={name}
                        autoFocus
                        rules={{ required: true }}
                    />
                ) : (
                    name
                )}
            </h2>
            {isEditing ? (
                <Form.Submit className={styles.editNameButton} clear>
                    <EditIcon />
                </Form.Submit>
            ) : (
                <Button
                    className={styles.editNameButton}
                    clear
                    onClick={() => setIsEditing(true)}
                >
                    <EditIcon />
                </Button>
            )}
        </Form>
    );
}
