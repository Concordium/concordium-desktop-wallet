import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

import { AddressBookEntry } from '../../utils/types';
import styles from './AddAddress.module.scss';

interface Props {
    close(): void;
    submit(name: string, address: string, note?: string): void;
    initialValues?: AddressBookEntry;
}

const NOTE_MAX_LENGTH = 255;

function AddAddress({ close, submit, initialValues }: Props) {
    const { handleSubmit, errors, control } = useForm<AddressBookEntry>({
        defaultValues: initialValues,
        mode: 'onTouched',
    });

    const onSubmit: SubmitHandler<AddressBookEntry> = ({
        address,
        name,
        note,
    }) => {
        submit(name, address, note);
        close();
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                rules={{ required: 'Name required' }}
                render={(p) => (
                    <Form.Input
                        {...p}
                        placeholder="Enter recipient name"
                        error={errors.name?.message}
                    />
                )}
            />
            <Controller
                name="address"
                control={control}
                rules={{
                    required: 'Address should be 50 characters',
                    minLength: {
                        value: 50,
                        message: 'Address should be 50 characters',
                    },
                    maxLength: {
                        value: 50,
                        message: 'Address should be 50 characters',
                    },
                }}
                render={(p) => (
                    <div className={styles.fieldWrapper}>
                        <Form.Input
                            {...p}
                            placeholder="Paste the account address here"
                            error={errors.address?.message}
                        />
                        <div className={styles.valueLength}>
                            {(p.value as string)?.length ?? 0}
                        </div>
                    </div>
                )}
            />
            <Controller
                name="note"
                control={control}
                rules={{
                    maxLength: {
                        value: NOTE_MAX_LENGTH,
                        message: 'Message cannot be longer than 255 characters',
                    },
                }}
                render={(p) => (
                    <div className={styles.fieldWrapper}>
                        <Form.TextArea
                            {...p}
                            value={(p.value as string)?.substring(
                                0,
                                NOTE_MAX_LENGTH - 1
                            )}
                            placeholder="You can add a note here"
                            error={errors.note?.message}
                        />
                        <div className={styles.valueLength}>
                            {(p.value as string)?.length ?? 0} /{' '}
                            {NOTE_MAX_LENGTH}
                        </div>
                    </div>
                )}
            />
            <Button positive type="submit">
                Submit
            </Button>
        </Form>
    );
}

AddAddress.defaultProps = {
    initialValues: undefined,
};

export default AddAddress;
